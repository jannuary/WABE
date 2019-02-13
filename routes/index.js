var express = require('express');
var app = express();

app.use('/user', require('../api/user'));
app.use('/social', require('../api/social'));
// app.use('/upload', require('../api/upload'));

app.all('/', (req, res)=>{
    res.send('hello world!');
});
module.exports = app;
