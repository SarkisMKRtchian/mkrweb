"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
/**
 * This class monitors the number of requests to your server and if the requests exceed the norm, it blocks the user’s ip
 *
 * Example:
 * ```
 * const bot: BotControll = new BotControll({path: 'dirName + users.JSON', block: 'dirName + block.JSON', maxRequests: 10000, interval: 60000});
 * ```
 */
class BotControll {
    /**
     *
     * @param path File where users will be recorded. file type: JSON
     * @param block File for blocked users. file type: JSON
     * @param maxRequests Maximum requests
     * @param interval Check interval (ms)
     */
    constructor(params) {
        this.createFile = (ip) => {
            const user = {
                [ip]: {
                    ip,
                    response: 0,
                    lastResponse: new Date().getTime()
                }
            };
            const file = JSON.stringify([user]);
            (0, fs_1.writeFileSync)(this.path, file);
        };
        /**
         * #### Check user ip.
         * If the number of requests in the specified interval `BotControll({interval: 10000})`
         * is greater than the specified number of requests `BotControll({maxRequests: 500})` then it will return true, otherwise it will return false
         * @param ip user ip
         */
        this.check = (ip) => {
            if (!(0, fs_1.existsSync)(this.path) || !(0, fs_1.readFileSync)(this.path, 'utf-8'))
                this.createFile(ip);
            const blockIp = (0, fs_1.existsSync)(this.block) ? JSON.parse((0, fs_1.readFileSync)(this.block, 'utf-8')) : [];
            if (blockIp.includes(ip)) {
                return true;
            }
            const users = JSON.parse((0, fs_1.readFileSync)(this.path, 'utf-8'));
            users.forEach(user => {
                if (!user.hasOwnProperty(ip)) {
                    user[ip] = {
                        ip,
                        response: 0,
                        lastResponse: new Date().getTime()
                    };
                }
                else {
                    const time = new Date().getTime();
                    if (time < user[ip].lastResponse + this.interval && user[ip].response >= this.maxRequests) {
                        if (!(0, fs_1.existsSync)(this.block))
                            (0, fs_1.writeFileSync)(this.block, JSON.stringify([ip]));
                        else {
                            const blocks = JSON.parse((0, fs_1.readFileSync)(this.block, 'utf-8'));
                            blocks.push(ip);
                            (0, fs_1.writeFileSync)(this.block, JSON.stringify(blocks));
                        }
                    }
                    else if (time > user[ip].lastResponse + this.interval) {
                        user[ip].response = 0;
                    }
                    else {
                        user[ip].response += 1;
                    }
                    user[ip].lastResponse = time;
                }
            });
            (0, fs_1.writeFileSync)(this.path, JSON.stringify(users));
            return false;
        };
        this.path = params.path;
        this.block = params.block;
        this.maxRequests = params.maxRequests ? params.maxRequests : 500;
        this.interval = params.interval ? params.interval : 10000;
    }
}
exports.default = BotControll;
