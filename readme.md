# MKRWEB

## Hello 👋 ! My name is Sarkis! I'm a beginner web developer. And I would like to share with you my small package for server-side development.

### So what's included in this package?
- Easier work with the mysql database Using the [mysql2](https://www.npmjs.com/package/mysql2) package
- Methods for encrypting/decrypting data, as well as clearing strings from HTML
- A method that will allow you to block users (bots) who make a lot of requests to the server

### SQL

Create connection
```js
const mkrweb = new MKRWEB({
    sql: {
        database: 'mkrweb_db', 
        host: 'localhost', 
        username: 'root', 
        password: ''
    }
})
```

Assign the path and language for recording log files
```js
const sql = mkrweb.sql();
sql.setLanguage("EN");
sql.setPath(join('sql.log'));
```
Exmaple log file
```log
-------ERROR IN ASYNCHRONOUS REQUEST-------
Code: ER_PARSE_ERROR
Message: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'use' at line 1
Request: SELECT * FROM use
Time: 23.11.2023 22:22:49
```


Select data from database (Synchronous / Asynchronous)

```js
const data: iSelectTinfo = {
    columns: '*',
    identifier: "name = 'Alex'",
    order: {
        column: 'id',
        type: "DESC",
        limit: 10
    }
}
//Asynchronous
sql.select<userType[]>('user', data, result => console.log(result));
//Synchronous
sql.selectSync<userType[]>('users', data).then(result => console.log(result));
```
Add data to database (Synchronous / Asynchronous)

```js
// table columns: id, name, age, email, password
// If id is auto increment then write null
const data = [null, 'Alex', 18, 'alex@email.com', 'hwabcdksjb'];

//Asynchronous
sql.add('users', data, added => {
    if(added) console.log('user added');
    else console.log('user not added');
});

//Synchronous
sql.addSync('users', data).then(added => {
    if(added) console.log('user added');
    else console.log('user not added');
})
```

Update data in database (Synchronous / Asynchronous)

```js
const columns = ['name', 'email'];
const newData = ['Jack', 'jack@email.com'];

//Asynchronous
sql.update('users', {columns: columns, values: newData, identifier: 'id = 5'}, updated => {
    if(updated) console.log('user updated');
    else console.log('user not updated');
})

//Synchronous
sql.updateSync('users', {columns: columns, values: newData, identifier: 'id = 5'}).then( updated => {
    if(updated) console.log('user updated');
    else console.log('user not updated');
})
```

Delete data from database (Synchronous / Asynchronous)

```js
// if you do not specify an identifier, all rows will be deleted from the database

//Asynchronous
sql.delete({table: 'users', identifier: 'id = 5'}, deleted => {
    if(deleted) console.log('user deleted');
    else console.log('user not deleted');
});

//Synchronous
sql.deleteSync({table: 'users', identifier: 'id = 5'}).then(deleted => {
    if(deleted) console.log('user deleted');
    else console.log('user not deleted');
});
```

### CRYPTER
Get a crypter
```js
const crypto = mkrweb.crypt();
```

Encrypt data
You can encrypt both strings and objects, arrays, etc...
```js
const string = 'hello world!';
const user   = {
    name: 'Alex',
    age: 18
}

const encryptString = crypto.encrypt(string); 
// bUpmUlcrUERTUDUlU1A1JTQ4NDVzcml4V3NFczQ4NDVBdjd6U1A1JU1FYVA5ZjRn

const encryptUser = crypto.encrypt(JSON.stringify(user)); 
// dmpkYXM2NWQ3c1c1UXBzVG1qSGRXK1BEczY1ZHh2d3NzNjVkTFMmV1NQNSVXK1BEYk5hc3M2NWQwNmdhczY1ZFFwc1RXYkhzVytQRHM2NWR4dndza29zcHNkZGt2c3B4
```

Decrypt data
```js
const decryptString = crypto.decrypt(encryptString);
// hello world!
const decryptUser   = crypto.decrypt(encryptUser);
// {"name":"Alex","age":18}
```

Remove HTML tags
```js
const user = {
    name: '<h1>Alex</h1>',
    age: '<script>alert(18)</script>'
}

const removeHtml = crypto.clearHTML(user);
// { name: 'h1Alexh1', age: 'scriptalert(18)script' }
```

### BotControll

This method monitors the number of requests to your server and if the requests exceed the norm, it blocks the user’s ip

Create connection

```js
const mkrweb = new MKRWEB({
    bot: {
        path: join(__dirname, 'bots.JSON'),
        block: join(__dirname, 'block.JSON'),
        interval: 3000, // Blocking interval
        maxRequests: 50 // Maximum number of requests
    }
})
```

How does it work
```js
// ***Server simulation
const ip = '15.210.48.54';
for(let i = 0; i < 100; i++){
    if(bot.check(ip)) {
        console.log('user blocked!'); break;
    }
}
```