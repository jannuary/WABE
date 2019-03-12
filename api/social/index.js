const express=require('express');
const fs=require('fs');
const bodyParser=require('body-parser');
const multer=require('multer');
const ObjectID = require('mongodb').ObjectID; // id 查找


// 连接mongodb
const db = require('../../db');

//创建app
var app=express();
app.use(bodyParser.urlencoded({extended:false}));

//设置文件上传存储路径
const uploadDir='./public/social/';
//设置multer upload
var upload=multer({dest:uploadDir}).array('images');
var _upload = multer().array(); // 获取 body

// post说说请求 提交表单 （文件）
// 其中图片的字段名必须是与 array 规定的一致，即 imgages
let talk = require('./talk.js')

// 评论
let comment =require('./comment.js')

// 圈子，分组查找，再组合
let talkAndComment = require('./talkAndComment.js')

// 说说点赞 
let likes = require('./likes.js')

// 关注点赞
let focus = require('./focus.js')

let routerPath = {
    talk_pic:   ['/talk_pic', upload, talk.postTalkPic],            // 说说图片
    show:       ['/show', _upload, talkAndComment.show],   // 展示朋友圈的所有内容
    showhot:    ['/showhot', _upload, talkAndComment.showhot],// 展示热门
    showperson: ['/showperson', _upload, talkAndComment.showperson],// 展示热门
    comment:    ['/comment', _upload, comment.toComment],  // 评论
    talk:       ['/talk', _upload, talk.toTalk],           // post说说请求 提交表单(文字)
    talk_like:  ['/talk_like', _upload ,likes.talk_like],  // 说说点赞
    comment_like: ['/comment_like',_upload ,likes.comment_like],   // 评论点赞
    focus:      ['/focus',_upload,focus.fc],               // 关注
    getFocu:    ['/getfocus',_upload,focus.getFocus]       // 获得所有关注
}

for(let x in routerPath){
    let mth = routerPath[x]
    app.post(mth[0], mth[1], mth[2])
}


// 请求朋友圈图片 images
app.all('/imgs',(req, res)=>{
    let query = req.query;
    console.log(query)
    // 文件路劲
    let pathName = uploadDir + query.images;
    console.log(pathName);
    res.sendfile(pathName)
})



module.exports = app;