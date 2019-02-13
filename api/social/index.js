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

// post说说请求 提交表单,
// 其中图片的字段名必须是与 array 规定的一致，即 imgages
app.post('/talk',(req,res,next)=>{
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
            // 存储信息
            // 获取body 所有字段名
            let query = req.body;
            // 集合名字
            let collection = "social_talk";
            // 存储信息
            let data = {
                userName: null,
                content: query.content,
                images: imgName,
                created: new Date().getTime()
            }

            //回复字典信息
            let info = {
                ok:'成功',
                fail: '失败'
            }
            // 回复信息
            var result = {
                status:0,
                info: info.fail,
            };

            // 查找用户名
            let whereStr = {
                _id:ObjectID(query.userID)
            }
            db.find("site",whereStr,(err, rs)=>{ 
                if (err) {
                    res.send(502);
                }else{
                    if(rs.length == 0){
                        res.json(JSON.stringify(result));
                    }else{
                        data.userName = rs.shift().userName;
                        // 插入数据库
                        db.insertOne(collection, data, (err, results)=>{
                            if (err) {
                                res.send(502);
                            }else{
                                if(results.insertedCount ==1){
                                    result.status = 1;
                                    result.info = info.ok;
                                    //返回
                                    res.json(JSON.stringify(result));
                                }else{
                                    //返回
                                    res.json(JSON.stringify(result));
                                }
                            }
                        })
                    }
                }
            })

            
            
        }

    });
});


// 评论
app.post('/comment',(req, res)=>{
    upload(req,res,(err)=>{
        // 获取body 所有字段名
        let query = req.body;
        // 集合名字
        let collection = "social_comment";
        // 存储信息
        let data = {
            userName: null,
            talkID: query.talkID,
            for: query.userName,
            content: query.content,
            created: new Date().getTime()
        }

        //回复字典信息
        let info = {
            ok:'成功',
            fail: '失败'
        }
        // 回复信息
        var result = {
            status:0,
            info: info.fail,
        };


        // 查找用户名
        let whereStr = {
            _id:ObjectID(query.userID)
        }
        db.find("site",whereStr,(err, rs)=>{ 
            if (err) {
                res.send(502);
            }else{
                if(rs.length == 0){
                    res.json(JSON.stringify(result));
                }else{
                    data.userName = rs.shift().userName;
                    // 插入数据库
                    db.insertOne(collection, data, (err, results)=>{
                        if (err) {
                            res.send(502);
                        }else{
                            if(results.insertedCount ==1){
                                result.status = 1;
                                result.info = info.ok;
                                //返回
                                res.json(JSON.stringify(result));
                            }else{
                                //返回
                                res.json(JSON.stringify(result));
                            }
                        }
                    })
                }
            }
        })
        
    })
})

// 圈子，分组查找，再组合
app.post('/show',(req, res)=>{
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
            // 所有评论       
            let colComment = "social_comment";
            db.findAndSort(colComment,null,sort,(err, comrs)=>{ 
                if (err) {
                    res.send(502);
                }else{
                    talkrs.forEach((talk)=>{
                        // 查找说说相应的评论
                        let talk_comment={
                            userName: talk.userName,
                            content: talk.content,
                            images: talk.images.split('|'),
                            created: talk.created,
                            comment: comrs.filter((c)=> {return c.talkID == talk._id }),
                        };
                        arrTalk.push(talk_comment);  
                    })
                    
                    res.send(arrTalk);
                }
            })
        }
    })

    


})

// 请求朋友圈图片 images
app.all('/imgs',(req, res)=>{
    upload(req,res,(err)=>{
        let query = req.body;
        console.log(query)
        // 文件路劲
        let pathName = uploadDir + query.images;
        res.sendfile(pathName)
    })
})



module.exports = app;