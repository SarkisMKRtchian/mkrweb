import { appendFile, existsSync, readFileSync, writeFileSync } from "fs";
import { iUser } from "./types";

/**
 * This class monitors the number of requests to your server and if the requests exceed the norm, it blocks the user’s ip
 * 
 * Example:
 * ```
 * const bot: BotControll = new BotControll({path: 'dirName + users.JSON', block: 'dirName + block.JSON', maxRequests: 10000, interval: 60000});
 * ```
 */
class BotControll {

    private path: string;
    private block: string;
    private maxRequests: number;
    private interval: number;

    /**
     * 
     * @param path File where users will be recorded. file type: JSON
     * @param block File for blocked users. file type: JSON
     * @param maxRequests Maximum requests
     * @param interval Check interval (ms)
     */
    public constructor(params: {path: string, block: string, maxRequests?: number, interval?: number}){
        this.path = params.path;
        this.block = params.block;
        this.maxRequests = params.maxRequests ? params.maxRequests : 500;
        this.interval = params.interval ? params.interval : 10000;
    }

    private createFile = (ip: string): void => {
        const user: iUser = {
            [ip]: {
                ip,
                response: 0,
                lastResponse: new Date().getTime()
            }
        }

        const file = JSON.stringify([user]);
        writeFileSync(this.path, file);
    }

    /**
     * #### Check user ip. 
     * If the number of requests in the specified interval `BotControll({interval: 10000})`
     * is greater than the specified number of requests `BotControll({maxRequests: 500})` then it will return true, otherwise it will return false
     * @param ip user ip
     */
    public check = (ip: string): boolean => {
        if(!existsSync(this.path) || !readFileSync(this.path, 'utf-8')) this.createFile(ip);

        const blockIp: string[] = existsSync(this.block) ? JSON.parse(readFileSync(this.block, 'utf-8')) : [];

        if(blockIp.includes(ip)){
            return true;
        }

        const users: iUser[] = JSON.parse(readFileSync(this.path, 'utf-8'));
        users.forEach(user => {
            if(!user.hasOwnProperty(ip)){
                user[ip] = {
                    ip,
                    response: 0,
                    lastResponse: new Date().getTime()
                }
            }else {
                const time: number = new Date().getTime();
                if(time < user[ip].lastResponse + this.interval && user[ip].response >= this.maxRequests){

                    if(!existsSync(this.block))  writeFileSync(this.block, JSON.stringify([ip]));

                    else {
                        const blocks: string[] = JSON.parse(readFileSync(this.block, 'utf-8'));
                        blocks.push(ip);
                        writeFileSync(this.block, JSON.stringify(blocks));
                    }
                }else if (time > user[ip].lastResponse + this.interval){
                    user[ip].response = 0;
                }else {
                    user[ip].response += 1;
                }
                user[ip].lastResponse = time;
            }
        })

        writeFileSync(this.path, JSON.stringify(users));

        return false;
    }
}

export default BotControll;

