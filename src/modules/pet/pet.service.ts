import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import imageSize from 'image-size';
import { Pool, PoolClient } from 'pg';
import { DATABASE_POOL } from 'src/constants/database.constants';
import { IResponseFail } from 'src/types/response/index.interface';
import { FileService } from '../file/file.service';
import { CreateAndUpdatePetDto } from './dto/createPet.dto';
import { DeletePetDto } from './dto/deletePet.dto';

@Injectable()
export class PetService {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly database: Pool,
    private readonly fileService: FileService,
  ) {}

  async updatePetAvatar(
    id: number,
    avatar: Express.Multer.File,
    client?: PoolClient,
  ) {
    try {
      let currentPetAvatar = (
        await client.query(
          `
            SELECT * FROM pet_avatar
            WHERE pet_id = $1
        `,
          [id],
        )
      ).rows[0];

      const file = await this.fileService.createFile(avatar, 'pets');

      const currentImageSize = await imageSize(avatar.buffer);

      const avatars = (
        await Promise.all([
          this.fileService.createResizedImage(file, 70, {
            width: 24,
            height: 24,
          }),
          this.fileService.createResizedImage(file, 70, {
            width: 48,
            height: 48,
          }),
          this.fileService.createResizedImage(file, 70, {
            width: 128,
            height: 128,
          }),
          currentImageSize.width > 800
            ? this.fileService.createResizedImage(file, 70, { width: 800 })
            : this.fileService.generateFileToJPG(file, 70),
        ])
      ).map((avatar: string) => avatar.split('assets/')[1]);

      if (currentPetAvatar) {
        this.fileService.deleteFile(currentPetAvatar.small);
        this.fileService.deleteFile(currentPetAvatar.middle);
        this.fileService.deleteFile(currentPetAvatar.large);
        this.fileService.deleteFile(currentPetAvatar.default_avatar);

        currentPetAvatar = (
          await client.query(
            `
                UPDATE pet_avatar
                SET small = $2, middle = $3, large = $4, default_avatar = $5
                WHERE pet_id = $1 
            `,
            [id, ...avatars],
          )
        ).rows[0];
      } else {
        currentPetAvatar = (
          await client.query(
            `
                INSERT INTO pet_avatar(pet_id, small, middle, large, default_avatar)
                VALUES (
                    $1, $2, $3, $4, $5
                )
            `,
            [id, ...avatars],
          )
        ).rows[0];
      }

      // this.fileService.deleteFile(file.fullPath)
    } catch (err) {
      const errObj: IResponseFail = {
        status: false,
        message: err.message || 'Ошибка при работе с файлом',
      };

      throw new HttpException(errObj, err.status || 500);
    }
  }

  async getPetWithAvatars(id: number) {
    return (
      await this.database.query(
        `
            SELECT 
                pets.id,
                pets.name,
                bio,
                date_of_birthday,
                user_uid,
                json_build_object(
                    'small',pet_avatar.small,
                    'middle',pet_avatar.middle,
                    'large',pet_avatar.large,
                    'default_avatar',pet_avatar.default_avatar
                ) AS avatars,
                json_build_object(
                    'id',tags_type.id,
                    'name',tags_type.name
                ) AS type,
                json_build_object(
                    'id',tags_breed.id,
                    'name',tags_breed.name
                ) AS breed
            FROM pets
            LEFT JOIN pet_avatar ON pets.id = pet_avatar.pet_id
            INNER JOIN tags tags_type ON pets.type = tags_type.id
            LEFT JOIN tags tags_breed ON pets.breed = tags_breed.id
            WHERE pets.id = $1
            LIMIT 1
        `,
        [id],
      )
    ).rows[0];
  }

  async create({ avatar, ...dto }: CreateAndUpdatePetDto) {
    const client = await this.database.connect();
    try {
      let valuesDB = '';
      let query = ``;
      let i: number = 1;
      const values = [];

      for (const key in dto) {
        query += `$${i}, `;
        valuesDB += `${key}, `;
        i++;
        values.push(dto[key]);
      }

      if (query) {
        query = query.slice(0, -2);
        valuesDB = valuesDB.slice(0, -2);
      }

      console.log(query);
      console.log(valuesDB);

      const Pet = (
        await client.query(
          `
                INSERT INTO pets(${valuesDB})
                VALUES(${query})
                RETURNING *
            `,
          values,
        )
      ).rows[0];

      if (avatar) {
        await this.updatePetAvatar(Pet.id, avatar, client);
      }

      await client.query('COMMIT');

      return await this.getPetWithAvatars(Pet.id);
    } catch (err) {
      await client.query('ROLLBACK');
      const errObj: IResponseFail = {
        status: false,
        message: err.message,
      };
      throw new HttpException(errObj, err.status || 500);
    } finally {
      await client.release();
    }
  }

  async delete({ pet_id, user_uid }: DeletePetDto) {
    const pet = (
      await this.database.query(
        `
          SELECT user_uid 
          FROM pets
          WHERE id = $1
          LIMIT 1 
      `,
        [pet_id],
      )
    ).rows[0];

    if (pet.user_uid != user_uid) {
      const objError: IResponseFail = {
        status: false,
        message: 'Вы не владелец данного питомца',
      };

      throw new ForbiddenException(objError);
    }

    await this.database.query(
      `
              DELETE FROM pets
              WHERE id = $1
          `,
      [pet_id],
    );
  }

  async getPetById(id: number) {
    return (
      await this.database.query(
        `
              SELECT * FROM pets
              WHERE id = $1
              LIMIT 1
          `,
        [id],
      )
    ).rows[0];
  }
}
