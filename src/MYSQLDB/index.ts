import mysql, { Connection, FieldPacket } from "mysql2";
import mysqlSync, {Connection as ConnectionSync, FieldPacket as FieldPacketSync, QueryError} from "mysql2/promise";
import { join, extname } from "path";
import { appendFileSync, existsSync, writeFileSync } from "fs";
import { iSelectTinfo, iUpdateTableData, tLanguages, tLogMethods } from "./types";

class MYSQLDB {
    private path?: string;
    private host:  string;
    private database: string;
    private username: string;
    private password: string;
    private connect:  Connection;
    private connectPromise: Promise<ConnectionSync>;
    private language: tLanguages = "EN";

    public constructor(host: string, database: string, username: string, password: string) {
        this.host     = host;
        this.database = database;
        this.username = username;
        this.password = password;

        this.connect = mysql.createConnection({
            host:     this.host,
            user:     this.username,
            database: this.database,
            password: this.password
        })

        this.connectPromise = this.connectSync();
    }

    private connectSync = async (): Promise<ConnectionSync> => {
        return await mysqlSync.createConnection({
            host:     this.host,
            user:     this.username,
            database: this.database,
            password: this.password
        })
    }

    /**
     * #### Set the path where you want to write log files.
     * 
     * Example: 
     * ``` 
     * mysql.setPath(['logs', 'log.log']) 
     * ```
     */
    public setPath = (path: string): void => {
        this.path = join(path);
    }

    /**
     * #### Set the language for recording log files
     * 
     * Examples: 
     * ```
     * mysql.setLanguage("EN"); //logs language: English
     * mysql.setLanguage("RU"); //logs language: Russian
     * mysql.setLanguage("HY"); //logs language: Armenian
     * mysql.setLanguage("ES"); //logs language: Espanol
     * ```
     */
    public setLanguage = (language: tLanguages): void => {
        this.language = language;
    }

    /**
     * 
     * #### Select data in db (async)
     * 
     * Examples: 
     * ```
     * mysql.select<userType[]>('users', {columns: '*'}, data => ...); // select all
     * mysql.select<{email: string}[]>('users', {columns: 'email', identifier: 'id = 5'}, data => ...); // select by identifier
     * mysql.select<{email: string}[]>('users', {columns: 'email', order: {column: 'id', limit: 5, type: 'DESC' } data => ...) // select data by limit
     * mysql.select<FieldPacket[]>('users', {columns: '*'}, (value, fields) => ...) // select data and fields
     * ```
     */
    public select = <T>(table: string, tableInfo: iSelectTinfo, callBack: (value: T, fields?: FieldPacket[]) => void): void => {
        const sql: string = `SELECT ${tableInfo.columns} FROM ${table}` +
            (tableInfo.identifier ? ` WHERE ${tableInfo.identifier}` : '') +
            (tableInfo.order?.column && tableInfo.order?.type ? ` ORDER BY ${table}.${tableInfo.order.column} ${tableInfo.order.type}`: '') + 
            (tableInfo.order?.limit ? ` LIMIT ${tableInfo.order.limit}` : '')
        ;

        this.connect.query(sql, (err, res, fields) => {
            if(err){
                this.createLogMessage("select", err, sql); callBack(false as T); return;
            }
            callBack(res as T, fields);
        });
    }

    /**
     * #### Select data in db (sync)
     * 
     * Examples: 
     * ```
     * mysql.selectSync<userType[]>('users', {columns: '*'}).then(data => ...) // select all
     * //or
     * const data = await mysql.selectSync<userType[]>('users', {columns: '*'}) // select all
     * ```
     */
    public selectSync = async <T>(table: string, tableInfo: iSelectTinfo, field: boolean = false): Promise<T> => {
        const connect = await this.connectPromise;
        const sql: string = `SELECT ${tableInfo.columns} FROM ${table}` +
            (tableInfo.identifier ? ` WHERE ${tableInfo.identifier}` : '') +
            (tableInfo.order?.column && tableInfo.order?.type ? ` ORDER BY ${table}.${tableInfo.order.column} ${tableInfo.order.type}`: '') + 
            (tableInfo.order?.limit ? ` LIMIT ${tableInfo.order.limit}` : '');
        ;
        try{
            const [result, fields] = await connect.query(sql);
            if(field) return fields as T;

            return result as T;

        }catch(e){
            const err = e as QueryError;
            this.createLogMessage("selectSync", err, sql); return false as T;
        }
    }

    /**
     * #### Add data in db (async)
     * 
     * Examples: 
     *  ```
     * //IMPORTANT!!! Keep your data in order
     * mysql.add('users', ['Alex', 'alex@mail.com'], added => ...); // In this case, the variable added is either true or false
     * ```
     */
    public add = (table: string, data: any[], callBack: (value: boolean) => void): void => {
        this.select(table, {columns: '*', order: {limit: 1}}, (value, fields) => {
            if(!fields) { callBack(false); return }
            const colls:     string      = fields.map(value => {return value.name}).join(', ');
            const questMark: string      = fields.map(() => {return "?"}).join(', ');

            const sql: string = `INSERT INTO ${table} (${colls}) VALUES (${questMark})`;
            this.connect.query(sql, data, (err) => {
                if(err){    
                    this.createLogMessage("add", err, sql, data); callBack(false); return;
                } 

                callBack(true);

            })
            
        })
    }

    /**
     * #### Add data in db (sync)
     * 
     * Examples: 
     *  ```
     * //IMPORTANT!!! Keep your data in order
     * // In this case, the variable added is either true or false
     * mysql.addSync('users', ['Alex', 'alex@mail.com']).then(added => ...); 
     * //or
     * const added = await mysql.addSync('users', ['Alex', 'alex@mail.com']);
     * ```
     */
    public addSync = async (table: string, data: any[]): Promise<boolean> => {
        const connection: ConnectionSync = await this.connectPromise;

        const fields: FieldPacket[] = await this.selectSync<FieldPacket[]>(table, {columns: '*', order: {limit: 1}}, true);
        const colls:        string  = fields.map(value => { return value.name }).join(', ');
        const questMark:    string  = fields.map(value => { return '?' }).join(', ');

        const sql: string = `INSERT INTO ${table} (${colls}) VALUES (${questMark})`;

        try{
            await connection.query(sql, data);
            return true;
        }catch(e){
            const err = e as QueryError;
            this.createLogMessage("addSync", err, sql, data); return false;
        }
    }

    /**
     * #### Update data in db (async)
     * 
     * Examples:
     * ```
     * // In this case, the variable updated is either true or false
     * mysql.update('users', {columns: ['name', 'email'], values: ['Mike', 'mike@mail.com'], identifier: 'email = "alex@mail.com"'}, updated => ...);
     * ```
     */
    public update = (table: string, data: iUpdateTableData, callBack: (value: boolean) => void): void => {
        const sql: string = `UPDATE ${table} SET` + data.columns.map((value, index) => {return ` ${value} = ?`}) + 
                            (data.identifier ? ` WHERE ${table}.${data.identifier}` : '');
        
        this.connect.query(sql, data.values, (err) => {
            if(err){
                this.createLogMessage('update', err, sql, data.values); callBack(false); return;
            }

            callBack(true);
        })
    }

    /**
     * #### Update data in db (sync)
     * 
     * Examples:
     * 
     * ```
     * // In this case, the variable updated is either true or false
     * mysql.updateSync('users', {columns: ['name', 'email'], values: ['Mike', 'mike@mail.com'], identifier: 'email = "alex@mail.com"'}).then(updated => ...);
     * //or
     * const updated = await mysql.updateSync('users', {columns: ['name', 'email'], values: ['Mike', 'mike@mail.com'], identifier: 'email = "alex@mail.com"'});
     * ```
     */
    public updateSync = async (table: string, data: iUpdateTableData): Promise<boolean> => {
        const connection: ConnectionSync = await this.connectPromise;

        const sql: string = `UPDATE ${table} SET` + data.columns.map((value, index) => {return ` ${value} = ?`}) + 
                            (data.identifier ? ` WHERE ${table}.${data.identifier}` : '');

        try{
            await connection.query(sql, data.values);
            return true;
        }catch(e){
            const err = e as QueryError;
            this.createLogMessage('updateSync', err, sql, data.values); return false;
        }                            
    }

    public delete = (tableInfo: {table: string, identifier?: string}, callBack: (value: boolean) => void): void => {
        const sql: string = `DELETE FROM ${tableInfo.table}` + (tableInfo.identifier ? ` WHERE ${tableInfo.identifier}` : '');
        this.connect.query(sql, (err) => {
            if(err){
                this.createLogMessage("delete", err, sql); callBack(false); return;
            }

            callBack(true);
        })
    }

    public deleteSync = async (table: string, identifier?: string): Promise<boolean> => {
        const connection: ConnectionSync = await this.connectPromise;
        const sql: string = `DELETE FROM ${table}` + (identifier ? ` WHERE ${identifier}` : '');

        try{
            await connection.query(sql);
            return true;
        }catch(e){
            const err = e as QueryError;
            this.createLogMessage('deleteSync', err, sql); return false;
        }

    }

    private createLogMessage(method: tLogMethods, error: QueryError, sql: string, data?: any[]): void{
        const headers = {
            RU: {
                select: 'ОШИБКА В АСИНХРОННОМ ЗАПРОСЕ',
                selectSync: 'ОШИБКА В СИНХРОННОМ ЗАПРОСЕ',
                add: 'ОШИБКА ПРИ ДОБАВЛЕНИИ ДАННЫХ (асинх)',
                addSync: 'ОШИБКА ПРИ ДОБАВЛЕНИИ ДАННЫХ (синх)',
                update: 'ОШИБКА ПРИ ОБНОВЛЕНИИ ДАННЫХ (асинх)',
                updateSync: 'ОШИБКА ПРИ ОБНОВЛЕНИИ ДАННЫХ (синх)',
                delete: 'ОШИБКА ПРИ УДАЛЕНИИ ДАННЫХ (асинх)',
                deleteSync: 'ОШИБКА ПРИ УДАЛЕНИИ ДАННЫХ (синх)'
            },

            EN: {
                select: 'ERROR IN ASYNCHRONOUS REQUEST',
                selectSync: 'ERROR IN SYNCHRONOUS REQUEST',
                add: 'ERROR WHEN ADDING DATA (async)',
                addSync: 'ERROR WHEN ADDING DATA (sync)',
                update: 'ERROR WHEN UPDATING DATA (async)',
                updateSync: 'ERROR WHEN UPDATING DATA (sync)',
                delete: 'ERROR WHEN DELETING DATA (async)',
                deleteSync: 'ERROR WHEN DELETING DATA (sync)'
            },

            HY: {
                select: 'ՍԽԱԼ ԱՍԻՆԽՐՈՆ ՀԱՐՑՈՒՄ',
                selectSync: 'ՍԽԱԼ ՍԻՆԽՐՈՆ ՀԱՐՑՈՒՄ',
                add: 'ՍԽԱԼ ՏՎՅԱԼՆԵՐ Ավելացնելիս (ասինխ)',
                addSync: 'ՍԽԱԼ ՏՎՅԱԼՆԵՐ Ավելացնելիս (սինխ)',
                update: 'ՍԽԱԼ ՏՎՅԱԼՆԵՐԸ ԹԱՐՄԱՑՆԵԼՈՒՑ (ասինխ)',
                updateSync: 'ՍԽԱԼ ՏՎՅԱԼՆԵՐԸ ԹԱՐՄԱՑՆԵԼՈՒՑ (սինխ)',
                delete: 'ՍԽԱԼ ՏՎՅԱԼՆԵՐԸ Ջնջելիս (ասինխ)',
                deleteSync: 'ՍԽԱԼ ՏՎՅԱԼՆԵՐԸ Ջնջելիս (սինխ)'
            },
            ES: {
                select: 'ERROR EN SOLICITUD ASÍNCRONA',
                selectSync: 'ERROR EN SOLICITUD SINCRÓNICA',
                add: 'ERROR AL AGREGAR DATOS (async)',
                addSync: 'ERROR AL AGREGAR DATOS (sync)',
                update: 'ERROR AL ACTUALIZAR DATOS (async)',
                updateSync: 'ERROR AL ACTUALIZAR DATOS (sync)',
                delete: 'ERROR AL BORRAR DATOS (async)',
                deleteSync: 'ERROR AL BORRAR DATOS (sync)'
            },
            DE: {
                select: 'FEHLER BEI DER ASYNCHRONEN ANFRAGE',
                selectSync: 'FEHLER BEI DER SYNCHRONEN ANFRAGE',
                add: 'FEHLER BEIM HINZUFÜGEN VON DATEN (asynchron)',
                addSync: 'FEHLER BEIM HINZUFÜGEN VON DATEN (Synchronisierung)',
                update: 'FEHLER BEIM AKTUALISIEREN VON DATEN (asynchron)',
                updateSync: 'FEHLER BEIM AKTUALISIEREN DER DATEN (Synchronisierung)',
                delete: 'FEHLER BEIM LÖSCHEN VON DATEN (asynchron)',
                deleteSync: 'FEHLER BEIM LÖSCHEN VON DATEN (Synchronisierung)'
            },
            UK: {
                select: 'ПОМИЛКА В АСИНХРОННОМУ ЗАПИТІ',
                selectSync: 'ПОМИЛКА В СИНХРОННОМУ ЗАПИТІ',
                add: 'ПОМИЛКА ПІД ЧАС ДОДАВАННЯ ДАНИХ (асинхронний)',
                addSync: 'ПОМИЛКА ПІД ЧАС ДОДАВАННЯ ДАНИХ (синх)',
                update: 'ПОМИЛКА ПІД ЧАС ОНОВЛЕННЯ ДАНИХ (асинхронний)',
                updateSync: 'ПОМИЛКА ПІД ЧАС ОНОВЛЕННЯ ДАНИХ (синх)',
                delete: 'ПОМИЛКА ПРИ ВИДАЛЕННІ ДАНИХ (асинхронний)',
                deleteSync: 'ПОМИЛКА ПРИ ВИДАЛЕННІ ДАНИХ (синх)'
            }
        }

        const message = {
            RU: 
            `\n\n-------${headers[this.language][method]}-------\n` +
            `Кода: ${error.code}\n` +
            `Сообщение: ${error.message}\n` + 
            `Запрос: ${sql}\n` +
            (data ? `Данные: ${data.join(', ')}\n` : '') +
            `Время: ${new Date().toLocaleString('fr-CH')}`,

            EN: 
            `\n\n-------${headers[this.language][method]}-------\n` +
            `Code: ${error.code}\n` +
            `Message: ${error.message}\n` + 
            `Request: ${sql}\n` +
            (data ? `Data: ${data.join(', ')}\n` : '') +
            `Time: ${new Date().toLocaleString('fr-CH')}`,

            HY: 
            `\n\n-------${headers[this.language][method]}-------\n` +
            `կոդ: ${error.code}\n` +
            `Հաղորդագրություն: ${error.message}\n` + 
            `Հայց: ${sql}\n` +
            (data ? `Տվյալներ: ${data.join(', ')}\n` : '') +
            `Ժամանակը: ${new Date().toLocaleString('fr-CH')}`,

            ES: 
            `\n\n-------${headers[this.language][method]}-------\n` +
            `Código: ${error.code}\n` +
            `Mensaje: ${error.message}\n` + 
            `Pedido: ${sql}\n` +
            (data ? `Datos: ${data.join(', ')}\n` : '') +
            `Tiempo: ${new Date().toLocaleString('fr-CH')}`,
            
            DE: 
            `\n\n-------${headers[this.language][method]}-------\n` +
            `Code: ${error.code}\n` +
            `Nachricht: ${error.message}\n` + 
            `Anfrage: ${sql}\n` +
            (data ? `Daten: ${data.join(', ')}\n` : '') +
            `Zeit: ${new Date().toLocaleString('fr-CH')}`,

            UK: 
            `\n\n-------${headers[this.language][method]}-------\n` +
            `Код: ${error.code}\n` +
            `Повідомлення: ${error.message}\n` + 
            `Запит: ${sql}\n` +
            (data ? `Даних: ${data.join(', ')}\n` : '') +
            `Час: ${new Date().toLocaleString('fr-CH')}`,
            
        }

        if(this.path){
            existsSync(this.path) ? appendFileSync(this.path, message[this.language]) : writeFileSync(this.path, message[this.language])
        }
    }

}

export default MYSQLDB;