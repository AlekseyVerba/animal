export class Messages {
    static registration(code: string): string {
        return `
            Token for registration: ${code}
        `
    }

    static rememberPassword(code: string): string {
        return `
           <div>To change your password follow the link. <a href='${process.env.DOMAIN}/${code}'>link</a></div>
        `
    }
}