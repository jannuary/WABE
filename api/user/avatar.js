const db = require('../../db');  // 导入数据库连接
const ObjectID = require('mongodb').ObjectID;   // 根据_id 查找用户
const fs = require("fs");

// 用户集合
let collection = "site";
// 默认头像名字
const avatarName = "default.jpg"

// 重命名, oldName 获取后缀名
let rename = (oldName)=>{
    // 获取后缀名
    let type = "."+oldName.split('.').pop();
    // 重命名
    let time = new Date().getTime();
    let rand = Math.floor(Math.random()*(100+1));
    let newName = (Math.random()*10000000).toString(16).substr(0,4)+'-'+(new Date()).getTime()+'-'+Math.random().toString().substr(2,5)+type;
    return newName;
}

// 存储头像，存图片名字到数据库
let upload_avatar = (req, res, next)=>{
    if (req.file.length === 0) {  //判断一下文件是否存在，也可以在前端代码中进行判断。
        res.end({status: 0, info: "上传文件不能为空！"});
        return
    } else {
        let file = req.file;
        let query = req.body;

        // 返回数据
        let result = {  
            status: 0,
            avatar: undefined
        }
        //修改文件名字
        let newName = rename(file.originalname);
        fs.renameSync( file.path, file.destination + newName); 
        
        // 判断数据
        if(query.userID == undefined){
            res.end(result);
            return;
        }else{
            let whereStr = { _id: ObjectID(query.userID) };
            let updateStr = {$set: { "avatar" : newName  }};
            
            // 存入数据
            // 根据 userID 查找用户，并更新数据
            db.updateOne(collection, whereStr, updateStr,(err, _results)=>{
                if (err) {
                    res.send(502);
                } 
                else{
                    // 设置响应类型及编码
                    res.set({
                        'content-type': 'application/json; charset=utf-8'
                    });
                    result.status = 1,
                    result.avatar = newName;
                    res.send(result);
                }
            })
        }
    }
}

// 获取头像
let avatar_img = (req, res, next)=>{
    let query = req.query;
    let whereStr = {};

    // 判断字段
    if(query.userID != undefined){
        whereStr = {
            _id : ObjectID(query.userID)
        }
        
    }else if(query.userName != undefined){
        whereStr = {
            userName : query.userName
        }
    }else{
        res.json({status: 0});
        return;
    }

    // 查找
    db.find(collection, whereStr, (err, _rlts)=>{
        if (err) {
            res.send(502);
        } 
        else{
            
            
            if(_rlts.length == 0){
                res.json({status: 0});
                return;
            }

            let _results = _rlts.shift();
            if(_results.avatar == undefined){   // 没有设置头像，则默认
                res.send({
                    status: 1,
                    img: avatarName
                });
            }else{
                res.send({
                    status: 1,
                    img: _results.avatar
                });
            }
        }
    })
}

module.exports = {
    "upload" : upload_avatar,
    "load" : avatar_img
};