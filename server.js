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

function getUsers(request, response) {
    console.log("getUsers")
    var db = new sqlite3.Database(DBSOURCE);
    db.all("SELECT * FROM users", function(err, rows) {
        if (err) {
            console.log(err);
        } else {
            response.send(rows);
        }
    });
    db.close();
}

function sendMessage(request, response) {
    console.log("sendMessage")
    var db = new sqlite3.Database(DBSOURCE);
    if (request.body.message_text.length > 0) {
        db.run("INSERT INTO messages (message_text, message_to_user_id, message_from_user_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)", [request.body.message_text, request.body.message_to_user_id, request.session.Id, Date.now, Date.now], function(err) {
            if (err) {
                console.log(err);
            } else {
                response.send({ success: true });
            }
        });
        db.close();
    } else {
        response.send({ success: false });
    }
}

function getMessages(req, response) {
    console.log("getMessages")
    console.log(req.params.id)
    var db = new sqlite3.Database(DBSOURCE);
    if (req.params.id) {
        db.all("SELECT * FROM messages WHERE message_to_user_id = ? AND message_from_user_id ORDER BY createdAt ASC", [req.params.id, req.session.Id], function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                response.send(rows);
            }
        });
        db.close();
    } else {
        response.send({ success: false });
    }
}

app.get('/login/:email', [login]);
app.get('/api/logout/', [checkSessions, logout]);
app.get('/api/test/', [checkSessions, loginTest]);
app.get('/api/users/', [checkSessions, getUsers]);

app.post('/api/messages', [checkSessions, sendMessage]);
app.get('/api/messages/:id', [checkSessions, getMessages]);

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

app.post('/api/login/', (request, response) => {
    console.log("login")
    if (request.body.email && request.body.password) {
        User.findOne({
            where: {
                email: request.body.email,
                password: request.body.password
            }
        }).then(user => {
            if (user) {
                request.session.loggedin = true;
                request.session.email = user.email;
                response.send({
                    success: true,
                    message: 'User logged in successfully!',
                    email: user.email,
                    id: user.id
                });
            } else {
                response.send({
                    success: false,
                    message: 'Incorrect email or password!'
                });
            }
        }).catch(err => {
            response.send({
                success: false,
                message: 'Incorrect email or password!',
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

app.get("/api/login-test/"), (request, response) => {
    console.log("login-test")
    User.findOne({
        where: {
            email: request.session.email,
            loggedIn: true
        }
    }).then(user => {
        if (user) {
            response.send({
                success: true,
                message: 'User logged in successfully!',
                email: user.email,
                id: user.id
            });
        } else {
            response.send({
                success: false,
                message: 'User not logged in!'
            });
        }
    }
    ).catch(err => {
        response.send({
            success: false,
            message: 'User not logged in!',
            err: err
        });
    });
};

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
        db.run(`CREATE TABLE messages (
            message_text VARCHAR(255) NOT NULL,
            message_to_user_id VARCHAR(255) NOT NULL,
            message_from_user_id VARCHAR(255) NOT NULL,
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL
        )`, (err) => {
            if (err) {
                console.error(err.message)
            } else {
                var insert = 'INSERT INTO messages (message_text, message_to_user_id, message_from_user_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
                db.run(insert, ['Hello', '5b37c3bf07145b5f0f82c9946dbdc2b1', '5b37c3bf07145b5f0f82c9946dbdc2b2', DATETIME, DATETIME])
                db.run(insert, ['Hi', '5b37c3bf07145b5f0f82c9946dbdc2b2', '5b37c3bf07145b5f0f82c9946dbdc2b1', DATETIME, DATETIME])
                db.run(insert, ['How are you?', '5b37c3bf07145b5f0f82c9946dbdc2b3', '5b37c3bf07145b5f0f82c9946dbdc2b1', DATETIME, DATETIME])
                db.run(insert, ['I am fine', '5b37c3bf07145b5f0f82c9946dbdc2b1', '5b37c3bf07145b5f0f82c9946dbdc2b3', DATETIME, DATETIME])
            }
        })
    }
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
