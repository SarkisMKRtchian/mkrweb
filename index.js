"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CRYPTER_1 = __importDefault(require("./src/CRYPTER"));
const MYSQLDB_1 = __importDefault(require("./src/MYSQLDB"));
const botcontroll_1 = __importDefault(require("./src/botcontroll"));
class MKRWEB {
    constructor(params) {
        this.sql = () => {
            if (!this.sqlConnectiom)
                throw new Error('No connection to database');
            return this.sqlConnectiom;
        };
        this.crypt = () => {
            return this.crypto;
        };
        this.bot = () => {
            if (!this.botControll)
                throw new Error('Paths for saving data are not specified');
            return this.botControll;
        };
        this.crypto = new CRYPTER_1.default;
        this.sqlConnectiom = params.sql && new MYSQLDB_1.default(params.sql.host, params.sql.database, params.sql.username, params.sql.password);
        this.botControll = params.bot && new botcontroll_1.default({ path: params.bot.path, block: params.bot.block, interval: params.bot.interval, maxRequests: params.bot.maxRequests });
    }
}
exports.default = MKRWEB;
