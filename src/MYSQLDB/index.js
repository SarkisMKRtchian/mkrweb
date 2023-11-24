"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const promise_1 = __importDefault(require("mysql2/promise"));
const path_1 = require("path");
const fs_1 = require("fs");
class MYSQLDB {
    constructor(host, database, username, password) {
        this.language = "EN";
        this.connectSync = async () => {
            return await promise_1.default.createConnection({
                host: this.host,
                user: this.username,
                database: this.database,
                password: this.password
            });
        };
        /**
         * #### Set the path where you want to write log files.
         *
         * Example:
         * ```
         * mysql.setPath(['logs', 'log.log'])
         * ```
         */
        this.setPath = (path) => {
            this.path = (0, path_1.join)(path);
        };
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
        this.setLanguage = (language) => {
            this.language = language;
        };
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
        this.select = (table, tableInfo, callBack) => {
            const sql = `SELECT ${tableInfo.columns} FROM ${table}` +
                (tableInfo.identifier ? ` WHERE ${tableInfo.identifier}` : '') +
                (tableInfo.order?.column && tableInfo.order?.type ? ` ORDER BY ${table}.${tableInfo.order.column} ${tableInfo.order.type}` : '') +
                (tableInfo.order?.limit ? ` LIMIT ${tableInfo.order.limit}` : '');
            this.connect.query(sql, (err, res, fields) => {
                if (err) {
                    this.createLogMessage("select", err, sql);
                    callBack(false);
                    return;
                }
                callBack(res, fields);
            });
        };
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
        this.selectSync = async (table, tableInfo, field = false) => {
            const connect = await this.connectPromise;
            const sql = `SELECT ${tableInfo.columns} FROM ${table}` +
                (tableInfo.identifier ? ` WHERE ${tableInfo.identifier}` : '') +
                (tableInfo.order?.column && tableInfo.order?.type ? ` ORDER BY ${table}.${tableInfo.order.column} ${tableInfo.order.type}` : '') +
                (tableInfo.order?.limit ? ` LIMIT ${tableInfo.order.limit}` : '');
            ;
            try {
                const [result, fields] = await connect.query(sql);
                if (field)
                    return fields;
                return result;
            }
            catch (e) {
                const err = e;
                this.createLogMessage("selectSync", err, sql);
                return false;
            }
        };
        /**
         * #### Add data in db (async)
         *
         * Examples:
         *  ```
         * //IMPORTANT!!! Keep your data in order
         * mysql.add('users', ['Alex', 'alex@mail.com'], added => ...); // In this case, the variable added is either true or false
         * ```
         */
        this.add = (table, data, callBack) => {
            this.select(table, { columns: '*', order: { limit: 1 } }, (value, fields) => {
                if (!fields) {
                    callBack(false);
                    return;
                }
                const colls = fields.map(value => { return value.name; }).join(', ');
                const questMark = fields.map(() => { return "?"; }).join(', ');
                const sql = `INSERT INTO ${table} (${colls}) VALUES (${questMark})`;
                this.connect.query(sql, data, (err) => {
                    if (err) {
                        this.createLogMessage("add", err, sql, data);
                        callBack(false);
                        return;
                    }
                    callBack(true);
                });
            });
        };
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
        this.addSync = async (table, data) => {
            const connection = await this.connectPromise;
            const fields = await this.selectSync(table, { columns: '*', order: { limit: 1 } }, true);
            const colls = fields.map(value => { return value.name; }).join(', ');
            const questMark = fields.map(value => { return '?'; }).join(', ');
            const sql = `INSERT INTO ${table} (${colls}) VALUES (${questMark})`;
            try {
                await connection.query(sql, data);
                return true;
            }
            catch (e) {
                const err = e;
                this.createLogMessage("addSync", err, sql, data);
                return false;
            }
        };
        /**
         * #### Update data in db (async)
         *
         * Examples:
         * ```
         * // In this case, the variable updated is either true or false
         * mysql.update('users', {columns: ['name', 'email'], values: ['Mike', 'mike@mail.com'], identifier: 'email = "alex@mail.com"'}, updated => ...);
         * ```
         */
        this.update = (table, data, callBack) => {
            const sql = `UPDATE ${table} SET` + data.columns.map((value, index) => { return ` ${value} = ?`; }) +
                (data.identifier ? ` WHERE ${table}.${data.identifier}` : '');
            this.connect.query(sql, data.values, (err) => {
                if (err) {
                    this.createLogMessage('update', err, sql, data.values);
                    callBack(false);
                    return;
                }
                callBack(true);
            });
        };
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
        this.updateSync = async (table, data) => {
            const connection = await this.connectPromise;
            const sql = `UPDATE ${table} SET` + data.columns.map((value, index) => { return ` ${value} = ?`; }) +
                (data.identifier ? ` WHERE ${table}.${data.identifier}` : '');
            try {
                await connection.query(sql, data.values);
                return true;
            }
            catch (e) {
                const err = e;
                this.createLogMessage('updateSync', err, sql, data.values);
                return false;
            }
        };
        this.delete = (tableInfo, callBack) => {
            const sql = `DELETE FROM ${tableInfo.table}` + (tableInfo.identifier ? ` WHERE ${tableInfo.identifier}` : '');
            this.connect.query(sql, (err) => {
                if (err) {
                    this.createLogMessage("delete", err, sql);
                    callBack(false);
                    return;
                }
                callBack(true);
            });
        };
        this.deleteSync = async (table, identifier) => {
            const connection = await this.connectPromise;
            const sql = `DELETE FROM ${table}` + (identifier ? ` WHERE ${identifier}` : '');
            try {
                await connection.query(sql);
                return true;
            }
            catch (e) {
                const err = e;
                this.createLogMessage('deleteSync', err, sql);
                return false;
            }
        };
        this.host = host;
        this.database = database;
        this.username = username;
        this.password = password;
        this.connect = mysql2_1.default.createConnection({
            host: this.host,
            user: this.username,
            database: this.database,
            password: this.password
        });
        this.connectPromise = this.connectSync();
    }
    createLogMessage(method, error, sql, data) {
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
        };
        const message = {
            RU: `\n\n-------${headers[this.language][method]}-------\n` +
                `Кода: ${error.code}\n` +
                `Сообщение: ${error.message}\n` +
                `Запрос: ${sql}\n` +
                (data ? `Данные: ${data.join(', ')}\n` : '') +
                `Время: ${new Date().toLocaleString('fr-CH')}`,
            EN: `\n\n-------${headers[this.language][method]}-------\n` +
                `Code: ${error.code}\n` +
                `Message: ${error.message}\n` +
                `Request: ${sql}\n` +
                (data ? `Data: ${data.join(', ')}\n` : '') +
                `Time: ${new Date().toLocaleString('fr-CH')}`,
            HY: `\n\n-------${headers[this.language][method]}-------\n` +
                `կոդ: ${error.code}\n` +
                `Հաղորդագրություն: ${error.message}\n` +
                `Հայց: ${sql}\n` +
                (data ? `Տվյալներ: ${data.join(', ')}\n` : '') +
                `Ժամանակը: ${new Date().toLocaleString('fr-CH')}`,
            ES: `\n\n-------${headers[this.language][method]}-------\n` +
                `Código: ${error.code}\n` +
                `Mensaje: ${error.message}\n` +
                `Pedido: ${sql}\n` +
                (data ? `Datos: ${data.join(', ')}\n` : '') +
                `Tiempo: ${new Date().toLocaleString('fr-CH')}`,
            DE: `\n\n-------${headers[this.language][method]}-------\n` +
                `Code: ${error.code}\n` +
                `Nachricht: ${error.message}\n` +
                `Anfrage: ${sql}\n` +
                (data ? `Daten: ${data.join(', ')}\n` : '') +
                `Zeit: ${new Date().toLocaleString('fr-CH')}`,
            UK: `\n\n-------${headers[this.language][method]}-------\n` +
                `Код: ${error.code}\n` +
                `Повідомлення: ${error.message}\n` +
                `Запит: ${sql}\n` +
                (data ? `Даних: ${data.join(', ')}\n` : '') +
                `Час: ${new Date().toLocaleString('fr-CH')}`,
        };
        if (this.path) {
            (0, fs_1.existsSync)(this.path) ? (0, fs_1.appendFileSync)(this.path, message[this.language]) : (0, fs_1.writeFileSync)(this.path, message[this.language]);
        }
    }
}
exports.default = MYSQLDB;
