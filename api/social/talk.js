const db = require('../../db');    // 连接mongodb 
const ObjectID = require('mongodb').ObjectID;   // id 查找

// 集合名字
let collection = "social_talk";

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

let show_talk = (req, res)=>{
    
}


const ret = {
    toTalk: talk,
}

module.exports = ret;