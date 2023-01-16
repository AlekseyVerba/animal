export class Messages {
    static registration(code: string): string {
        return `
            Code for registration: ${code}
        `
    }

    static rememberPassword(code: string): string {
        return `
           <div>To change your password write this code '${code}'</div>
        `
    }
}