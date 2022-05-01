var express = require('express');
var sqlite3 = require ('sqlite3').verbose()
const DBSOURCE = "db.sqlite"
const cors = require('cors');
var app = express();
var PORT = process.env.PORT || 8080;
var server = app.listen(PORT,() => console.log (`Listening on ${PORT}`));
app.use(express.json());
app.use(express.static(__dirname + '/static/'));
app.use(cors());

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to SQLite database.')
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text,
            age int,
            password text
        )`, (err) => {
            if (err) {
                console.error(err.message)
            } else {
                var insert = 'INSERT INTO user (name, age, password) VALUES (?, ?, ?)'
                db.run(insert, ['John', 20, '123456'])
                db.run(insert, ['Jane', 21, '123456789'])
                db.run(insert, ['Jack', 22, 'Qwerty'])
                db.run(insert, ['Jill', 23, 'Password'])
                db.run(insert, ['Joe', 24, '12345'])

            }
        })
    }
})

app.get("/user", (req, res, next) => {
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message })
            return
        }
        res.json({
            message: 'success',
            data: rows
        })
    });
});



app.post('/data/users',function(req,res) {
    console.log(req.body)
    res.end("OK");
});

app.get('/data/users',function(req,res) {
    res.json({
        users: [
            {
                name: 'John',
                age: 25
            },
            {
                name: 'Jane',
                age: 30
            },
        ]
    })
});