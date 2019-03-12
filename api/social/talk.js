const db = require('../../db');    // 连接mongodb 
const ObjectID = require('mongodb').ObjectID;   // id 查找
const fs=require('fs');

// 集合名字
let collection = "social_talk";

//设置文件上传存储路径
const uploadDir='./public/social/';

// 发布说说
let talk =  (req, res)=>{
    // 存储信息
    // 获取body 所有字段名
    let query = req.body;

    // 存储信息
    let data = {
        userName: null,
        content: query.content,
        images: query.images,
        created: new Date().getTime(),
        likes: 0,
    }

    //回复字典信息
    let info = {
        ok:'成功',
        fail: '失败',
        data: undefined,
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
                            result.data = data;
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

let talk_pic = (req, res)=>{
    //多个文件上传
 
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


const ret = {
    toTalk: talk,
    postTalkPic: talk_pic,
}

module.exports = ret;