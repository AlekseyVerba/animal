export class FollowAndUnfollowProfileDto {
  current_uid: string;
  profile: string | number;
  profile_type: 'user' | 'pet';
}
