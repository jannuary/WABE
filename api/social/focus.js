// 关注，与取消关注
/* 
    请求数据
    {
        userID: // 自己的id
        focus: // 这里带关注人的名字 
        cancel: 1/0   // 是否是取消关注， 1： 是取消关注，0: 关注（关注的时候可以不带）
    }
    返回
    {
        status: 0/1
        info: 
    }

*/

// 连接mongodb
const db = require('../../db');
const user = require('../user/userMsg.js')

// 集合名字
let coll = "focus" 

// 查找被关注人的 userID
let findID = (data)=>{
    return new Promise((resolve, reject)=>{
        // 不存用户在则返回
        if(data.length ==0){  
            reject(info.notE)
        }else{
            // 获取 关注人的 userID  
            resolve(data.shift()._id.toString())
        }
    })
}



// 关注与取消关注 路由 (还没有数据检查)
let fc = (req, res, next)=>{
    let query = req.body
    let exist = false; // 是否 

    // 字典
    let info = {
        fail: "focus fail",
        notE: "focus name not exist",
        fcself: "don't focus yourself",
        ok: "ok"
    }

    // 返回结果
    let result = {  
        status: 0,
        info: info.fail    // 默认是失败
    }

    // 检查是否为关注自己
    let isFcSelf = (id)=>{
        return new Promise((resolve, reject)=>{
            if(id == query.userID)
                reject(info.fcself)
            else
                resolve(id)
        })
    }

    // 查找是否已经存在关注关系
    let existRelation = (data)=>{
        return new Promise((resolve, reject)=>{
            let whereStr = {
                userID: query.userID,
                focus: data,
            }
            db.find(coll, whereStr,(err, rs)=>{     
                if(err){
                    res.json(result) 
                }else{
                    exist = rs.length != 0 ? true : false;
                    
                    // 取消关注
                    if(query.cancel == 1 && exist){  
                        console.log("cancel focus")
                        cancel(whereStr);
                    }else if(!exist && query.cancel != 1){ // 没有关注，则关注 
                        updated(data);
                    }else{
                        succRes();
                    }
                }
            })
        })
    }
    

    // 更新关注数据
    let updated = (fid)=>{
        // 插入的数据
        let data = {    
            userID: query.userID,
            focus: fid,
            focusName: query.focus,
            created: new Date().getTime()
        }

        db.insertOne(coll, data,(err, rs)=>{
            if(err){
                res.json(result) 
            }else{
                succRes();
            }
        })
    }

    // 取消关注
    let cancel = (whereStr)=>{
        db.deleteOne(coll, whereStr, (err,rs)=>{
            if(err){
                ress.json(result)
            }else{
                succRes();
            }
        })
    }

    // 成功后返回
    let succRes = ()=>{
        result.status = 1;
        result.info = info.ok;  
        res.json(result)
    }

    user.getUserMsg({ userName: query.focus })  // 被关注人的信息
    .then(findID)           // 被关注人的id
    .then(isFcSelf)         // 是否关注自己
    .then(existRelation)    // 是否已经存在关注关系
    .catch((data)=>{        // 关注出现问题
        result.info = data;
        res.json(result) 
    });
}   


// 根据 userID 获取关注
let fcCount = (whereStr)=>{
    return new Promise((resolve, reject)=>{
        db.find(coll, whereStr,(err, rs)=>{     
            if(err){
                reject() 
            }else{
                resolve(rs)
            }
        })
    })
}



module.exports = {
    "fc" : fc,
    fcCount : fcCount
}