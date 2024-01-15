export class Messages {
  static registration(code: string): string {
    return `
            Код для регистрации: ${code}
            (НЕОБХОДИМО СВЕРСТАТЬ ПОЧТОВЫЕ ФОРМЫ)
        `;
  }

  static rememberPassword(code: string): string {
    return `
           <div>Код для изменения пароля '${code}'</div>
           (НЕОБХОДИМО СВЕРСТАТЬ ПОЧТОВЫЕ ФОРМЫ)
        `;
  }
}
