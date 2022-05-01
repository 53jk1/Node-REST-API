var express = require('express');
const cors = require('cors');
var app = express();
var PORT = process.env.PORT || 8080;
var server = app.listen(PORT,() => console.log (`Listening on ${PORT}`));
app.use(express.static(__dirname + '/static/'));