var express = require('express');
const cors = require('cors');
var app = express();
var PORT = process.env.PORT || 8080;
var server = app.listen(PORT,() => console.log (`Listening on ${PORT}`));
app.use(express.json());
app.use(express.static(__dirname + '/static/'));
app.use(cors());

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