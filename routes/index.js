var express = require('express');
var app = express();

app.use('/user', require('../api/user'));
app.all('/', (req, res)=>{
    res.send('hello world!');
});
module.exports = app;
