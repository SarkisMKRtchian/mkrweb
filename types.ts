export interface iConnectSql {
    host:     string; 
    database: string; 
    username: string; 
    password: string;
}

/**
 * @param path File where users will be recorded. file type: JSON
 * @param block File for blocked users. file type: JSON
 * @param maxRequests Maximum requests
 * @param interval Check interval (ms)
 */
export interface iBotControll {
    path:         string, 
    block:        string, 
    maxRequests?: number, 
    interval?:    number
}