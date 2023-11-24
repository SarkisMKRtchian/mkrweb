import { iBotControll, iConnectSql } from "./types";
import { join } from "path";
import CRYPTER from "./src/CRYPTER";

import MYSQLDB from "./src/MYSQLDB";
import BotControll from "./src/botcontroll";

class MKRWEB {
    private botControll:   BotControll | undefined;
    private sqlConnectiom: MYSQLDB     | undefined;
    private crypto:        CRYPTER;

    public constructor(params: {sql?: iConnectSql, bot?: iBotControll}) {
        this.crypto        = new CRYPTER;
        this.sqlConnectiom = params.sql && new MYSQLDB(params.sql.host, params.sql.database, params.sql.username, params.sql.password);
        this.botControll   = params.bot && new BotControll({path: params.bot.path, block: params.bot.block, interval: params.bot.interval, maxRequests: params.bot.maxRequests})
    }


    public sql = (): MYSQLDB => {
        if(!this.sqlConnectiom) throw new Error('No connection to database');
        return this.sqlConnectiom;
    }

    public crypt = (): CRYPTER => {
        return this.crypto;
    }

    public bot = (): BotControll => {
        if(!this.botControll) throw new Error('Paths for saving data are not specified');

        return this.botControll;
    }
    

}

export default MKRWEB;


