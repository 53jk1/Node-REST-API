var express = require('express');
const Sequelize = require('sequelize');
var sqlite3 = require ('sqlite3').verbose()
const DBSOURCE = "db.sqlite"
const cors = require('cors');
var app = express();
var PORT = process.env.PORT || 8080;
var server = app.listen(PORT,() => console.log (`Listening on ${PORT}`));
app.use(express.json());
app.use(express.static(__dirname + '/static/'));
app.use(cors());

const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 9090});

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

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    state: {
        type: Sequelize.STRING,
        allowNull: false
    },
    zip: {
        type: Sequelize.STRING,
        allowNull: false
    },
    country: {
        type: Sequelize.STRING,
        allowNull: false
    },
    credit_card: {
        type: Sequelize.STRING,
        allowNull: false
    },
    expiration: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cvv: {
        type: Sequelize.STRING,
        allowNull: false
    },
    billing_zip: {
        type: Sequelize.STRING,
        allowNull: false
    },
    billing_address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    billing_city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    billing_state: {
        type: Sequelize.STRING,
        allowNull: false
    },
    billing_country: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shipping_zip: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shipping_address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shipping_city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shipping_state: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shipping_country: {
        type: Sequelize.STRING,
        allowNull: false
    },
    shipping_method: {
        type: Sequelize.STRING,
        allowNull: false
    },
    payment_method: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_status: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_date: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_total: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_items: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_shipping: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_tax: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_discount: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_total_paid: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_total_due: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_total_refunded: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_total_cancelled: {
        type: Sequelize.STRING,
        allowNull: false
    },
    order_total_returned: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

sequelize.sync()
    .then(() => console.log('Database & tables created!'))
    .catch(err => console.log(err));

app.get("/create-users", (req, res, next) => {
    User.create({name: "John", email: "john@mail.com", password: "12345", phone: "1234567890", address: "123 Main St", city: "New York", state: "NY", zip: "12345", country: "USA", credit_card: "1234567890123456", expiration: "12/20", cvv: "123", billing_zip: "12345", billing_address: "123 Main St", billing_city: "New York", billing_state: "NY", billing_country: "USA", shipping_zip: "12345", shipping_address: "123 Main St", shipping_city: "New York", shipping_state: "NY", shipping_country: "USA", shipping_method: "UPS", payment_method: "Visa", order_status: "Pending", order_date: "12/20/2019", order_total: "100", order_items: "1", order_shipping: "10", order_tax: "5", order_discount: "0", order_total_paid: "100", order_total_due: "0", order_total_refunded: "0", order_total_cancelled: "0", order_total_returned: "0"})
    .then(() => User.create({name: "Jane", email: "jane@mail.com", password: "12345", phone: "1234567890", address: "123 Main St", city: "New York", state: "NY", zip: "12345", country: "USA", credit_card: "1234567890123456", expiration: "12/20", cvv: "123", billing_zip: "12345", billing_address: "123 Main St", billing_city: "New York", billing_state: "NY", billing_country: "USA", shipping_zip: "12345", shipping_address: "123 Main St", shipping_city: "New York", shipping_state: "NY", shipping_country: "USA", shipping_method: "UPS", payment_method: "Visa", order_status: "Pending", order_date: "12/20/2019", order_total: "100", order_items: "1", order_shipping: "10", order_tax: "5", order_discount: "0", order_total_paid: "100", order_total_due: "0", order_total_refunded: "0", order_total_cancelled: "0", order_total_returned: "0"}))
    .then(user => res.json(user))
});

app.get("/user", (req, res, next) => {
    User.findAll().then(users => res.json(users));
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