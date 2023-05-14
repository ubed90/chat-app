interface Message {
    text: string,
    createdAt: number,
    userName?: string
}


export const generateMessage = (text: string, userName?: string): Message => {
    return {
        text,
        createdAt: new Date().getTime(),
        userName
    }
}


export * from './Users';