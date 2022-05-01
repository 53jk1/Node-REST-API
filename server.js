var express = require('express');
const Sequelize = require('sequelize');
var sqlite3 = require ('sqlite3').verbose()
const DBSOURCE = "orm-db.sqlite"
const DATETIME = '2022-05-01T11:31:31.471Z';
const cors = require('cors');
var session = require('express-session');
var app = express();
var PORT = process.env.PORT || 8080;
var server = app.listen(PORT,() => console.log (`Listening on ${PORT}`));
const crypto = require("crypto");
app.use(express.json());
app.use(express.static(__dirname + '/static/'));
app.use(cors());

const WebSocket = require('ws');
const wss = new WebSocket.Server({
    noServer: true,
});

const sessionParser = session({
    saveUninitialized: false,
    secret: '$secret',
    resave: false,
});

app.use(sessionParser);

function checkSessions(request, response, next) {
    console.log("checkSessions")
    if (request.session.loggedin) {
        next();
    } else {
        response.send({ loggedin: false });
    }
}

function login(request, response) {
    console.log("login")
    if (!request.session.loggedin) {
        request.session.loggedin = true;
        request.session.email = request.params.email;
        response.send({ loggedin: true });
    }
    response.send({ loggedin: true, email: request.session.email });
}

function logout(request, response) {
    console.log("logout")
    request.session.destroy();
    response.send({ loggedin: false });
}

function loginTest(request, response) {
    console.log("loginTest")
    response.send({ loggedin: true, email: request.session.email });
}

app.get('/login/:email', [login]);
app.get('/logout/', [checkSessions, logout]);
app.get('/test/', [checkSessions, loginTest]);

server.on('upgrade', function (request, socket, head) {
    wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', () => {
        console.log('user disconnected');
    })
});

const sequelize = new Sequelize('database', 'root', 'root', {
    dialect: 'sqlite',
    storage: 'orm-db.sqlite'
});

const User = sequelize.define('users', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
    }
});

sequelize.sync()
    .then(() => console.log('Database & tables created!'))
    .catch(err => console.log(err));

app.post('/api/register/', (request, response) => {
    console.log("register")
    console.log(request.body)
    if (request.body.email && request.body.password) {
        User.create({
            id: crypto.randomBytes(16).toString("hex"),
            email: request.body.email,
            password: request.body.password
        }).then(user => {
            response.send({
                success: true,
                message: 'User created successfully!',
                user: user
            });
        }).catch(err => {
            response.send({
                success: false,
                message: 'User already exists!',
                err: err
            });
        });
    } else {
        response.send({
            success: false,
            message: 'Please enter email and password!'
        });
    }
});

emailExists = (email) => {
    return User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if (user) {
            return true;
        } else {
            return false;
        }
    }).catch(err => {
        return false;
    });
}

app.get("/user", (req, res, next) => {
    User.findAll().then(user => res.json(user));
});

app.get("/user/:id", (req, res, next) => {
    User.findByPk(req.params.id).then(user => res.json(user));
});

app.get("userList/:id", (req, res, next) => {
    User.findAll({where: {id: req.params.id}}).then(user => res.json(user));
});

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to SQLite database.')
        db.run(`CREATE TABLE users (
            id VARCHAR(255) NOT NULL PRIMARY KEY,
            email UNIQUE,
            password VARCHAR(255),
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        )`, (err) => {
            if (err) {
                console.error(err.message)
            } else {
                var insert = 'INSERT INTO users (id, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
                db.run(insert, ['5b37c3bf07145b5f0f82c9946dbdc2b1', "john@wp.pl", '123456', DATETIME, DATETIME])
                db.run(insert, ['5b37c3bf07145b5f0f82c9946dbdc2b2', "jane@wp.pl", '123456789', DATETIME, DATETIME])
                db.run(insert, ['5b37c3bf07145b5f0f82c9946dbdc2b3', "jackspaniel@wp.pl", 'Qwerty', DATETIME, DATETIME])
                db.run(insert, ['5b37c3bf07145b5f0f82c9946dbdc2b4', "jill@wp.pl", 'Password', DATETIME, DATETIME])
                db.run(insert, ['5b37c3bf07145b5f0f82c9946dbdc2b5', "joe@wp.pl", '12345', DATETIME, DATETIME])

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

app.get("/user/:id", (req, res, next) => {
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message })
            return
        }
        res.json({
            message: 'success',
            data: row
        })
    });
});

app.post('/data/users',function(req,res) {
    console.log(req.body)
    res.end("OK");
});
