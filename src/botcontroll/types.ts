export interface iUser {
    [ip: string]: {
        ip: string;
        response: number;
        lastResponse: number;
    }
}

