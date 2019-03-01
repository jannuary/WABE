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

// post说说请求 提交表单 （文件）
// 其中图片的字段名必须是与 array 规定的一致，即 imgages
app.post('/talk_pic',(req,res,next)=>{
    //多个文件上传
    upload(req,res,(err)=>{
        if(err){
            console.error('[System] '+err.message);
        }else{
                    
            // 文件循环处理,返回所有文件的名字，用 | 分割
            let reqFile = ()=>{
                var fileCount=req.files.length;
                let names;
                req.files.forEach((i)=>{
                    // 随机重命名文件
                    let rename = (oldName)=>{
                        // 获取后缀名
                        let type = "."+oldName.split('.').pop();
                        // 重命名
                        let time = new Date().getTime();
                        let rand = Math.floor(Math.random()*(100+1));
                        let newName = (Math.random()*10000000).toString(16).substr(0,4)+'-'+(new Date()).getTime()+'-'+Math.random().toString().substr(2,5)+type;
                        return newName;
                    }
                    //名字
                    let name = rename(i.originalname);
                    // 存储名字
                    names = names == undefined ? name : names + '|' + name;
                    //设置存储的文件路径
                    var uploadFilePath=uploadDir+name;
                    //获取临时文件的存储路径
                    var uploadTmpPath=i.path;

                    
                    //读取临时文件
                    fs.readFile(uploadTmpPath,function(err,data){
                        if(err){
                            console.error('[System] '+err.message);
                        }else{
                            //读取成功将内容写入到上传的路径中，文件名为上面构造的文件名
                            fs.writeFile(uploadFilePath,data,function(err){
                                if(err){
                                    console.error('[System] '+err.message);
                                }else{
                                    //写入成功,删除临时文件
                                    fs.unlink(uploadTmpPath,function(err){
                                        if(err){
                                            console.error('[System] '+err.message);
                                        }else{
                                            console.log('[System] '+'Delete '+uploadTmpPath+' successfully!');
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
                return names;
            }
            
            // 所有文件上传成功,返回文件名字
            let imgName = reqFile();
            console.log(imgName)
            // 回复信息
            let result = {
                status: imgName==undefined ? 0: 1,
                images: imgName==undefined ? undefined : imgName.split('|'),
            };

            res.json(JSON.stringify(result));
        }

    });
});

// post说说请求 提交表单(文字)
let talk = require('./talk.js')
app.post('/talk', multer().array(), talk.toTalk)


// 评论
let comment =require('./comment.js')
app.post('/comment', multer().array(), comment.toComment)

// 圈子，分组查找，再组合
app.post('/show',(req, res)=>{
    upload(req,res,(err)=>{
    // 接收请求的数据
    let query = req.body;

    // 返回所有说说的内容
    let arrTalk = new Array(0);
    // 查找所有说说
    let colTalk = "social_talk";
    // 按时间降序排列
    let sort = {
        created: -1
    }
    // 所有说说
    db.findAndSort(colTalk,null,sort,(err, talkrs)=>{ 
        if (err) {
            res.send(502);
        }else{
            
            // 查找关注
            db.find("focus",{userID: query.userID}, (err, rs)=>{
                if (err) {
                    res.send(502);
                }else{
                    // console.log(rs)
                    allcomment(rs)
                }
            })


             // 所有评论  
            let allcomment = (fcs)=>{
                let colComment = "social_comment";
                sort.created = 1;
                db.findAndSort(colComment,null,sort,(err, comrs)=>{ 
                    if (err) {
                        res.send(502);
                    }else{
                        // 返回喜欢的人数，是否已经喜欢
                         let lk = (likeStr, userID)=>{
                            // 喜欢的人
                            let l = likeStr == 0 || likeStr == undefined? [] : likeStr.split('|');
                            // 是否已经喜欢
                            let led = false;
                            if(l.length !=0 && l.find((id)=>{ return id == userID }) !=undefined){
                                led = true;
                            }

                            return {
                                islike: led,
                                count: l.length
                            }
                        }

                        // 循环获取数据
                        talkrs.forEach((talk)=>{
                            let likeMsg = lk(talk.likes, query.userID);

                            // 返回的数据
                            let talk_comment={
                                talkID: talk._id,
                                userName: talk.userName,
                                content: talk.content,
                                images: talk.images ==null ? null : talk.images.split('|'),
                                created: talk.created,
                                likes: likeMsg.count,
                                liked: likeMsg.islike,
                                focus: fcs.some((c)=> {return c.focusName == talk.userName }),
                                comment: comrs.filter((c)=> {return c.talkID == talk._id }), // 查找说说相应的评论
                            };
                            for (let i = 0; i < talk_comment.comment.length; i++) {
                                likeMsg = lk(talk_comment.comment[i].likes, query.userID);
                                talk_comment.comment[i].commentID = talk_comment.comment[i]._id;
                                talk_comment.comment[i].likes = likeMsg.count;
                                talk_comment.comment[i].liked = likeMsg.islike;
                                delete talk_comment.comment[i]._id;
                                delete talk_comment.comment[i].talkID;
                            }
                            arrTalk.push(talk_comment);  
                        })

                        res.send(arrTalk);
                    }
                })
            }      
            
        }
    })
})
})

// 说说点赞 
let likes = require('./likes.js')
app.post('/talk_like',multer().array() ,likes.talk_like)

// 关注点赞
app.post('/comment_like',multer().array() ,likes.comment_like)

let focus = require('./focus.js')
app.post('/focus',multer().array(),focus.fc)

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