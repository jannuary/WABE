/*
    {
        userID: 
        talkID:
    }
 */
const db = require('../../db');    // 连接mongodb 
const ObjectID = require('mongodb').ObjectID;   // id 查找

let collection = "social_talk";     // 集合 => 说说点赞
let collection_comment = "social_comment";  // 评论点赞

// 查找某条状态的点赞数据 返回数组
let findLikes = (collection, whereStr)=>{
    return new Promise((resolve, reject)=>{
        db.find(collection,whereStr,(err, rs)=>{ 
            if (err) {
                reject('like err')
            }else{
                let lk = rs.shift().likes 
                let ls = lk == 0 || lk == undefined? [] : lk.split('|')
                resolve(ls);
            }
        })
    })
}

// 查看点赞状态
let checkStatus = (ls, userID)=>{
    return new Promise((resolve)=>{
        // 查看是否已经点赞过
        if(ls.indexOf(userID)!=-1){  // 有则删除 
            ls.splice(ls.indexOf(userID),1)
        }else{     // 没有则加进去
            ls.push(userID)
        }
        
        // 所有 userID 做成字符串
        let setStr = ls.join("|")
        resolve(setStr)
    })
}

// 更新点赞 （字符串形式）
let updatedLikes = (collection, whereStr, setStr)=>{
    return new Promise((resolve, reject)=>{
        // 跟新数据库
        let updated = {
            $set:{
                likes: setStr,
            }  
        }
        db.updateOne(collection,whereStr, updated,(err, _rs)=>{ 
            if (err) {
                reject('like err')
            }else{
                resolve(_rs)
            }
        })
    })
}

// 点赞
let like = (collection, whereStr, userID)=>{
    return new Promise( async (resolve, reject)=>{
        try{
            let ls = await findLikes(collection, whereStr);    // 查找,并返回所有数据
            let setStr = await checkStatus(ls, userID)    //   查看点赞状态
            let rs = await updatedLikes(collection, whereStr, setStr) // 更新，返回所有点赞的人

            resolve([rs,ls])    // 返回
        }catch(e){  // 错误返回数据
            reject(e)
        }
    })
}

// 说说点赞与取消点赞
let talk_like = (req, res)=>{
    let query = req.body;
    let whereStr = {
        _id:ObjectID(query.talkID),
    }

    // 返回数据
    let info = {
        fail: 'fail',
        fail_update: 'update fail',
        ok: 'ok',
        fail_like: 'fail like'
    }

    let result = {
        status: 0,
        info: info.fail,
        likes: undefined,
    }
    
    // 点赞
    like(collection, whereStr, query.userID)
    .then(([rs, ls])=>{
         // 返回数据
        if(rs.modifiedCount !=0){
            result.status = 1;
            result.likes = ls.length;
            result.info = info.ok;
            res.json(result)
        }else{
            throw info.fail_like;
        }
    })
    .catch((e)=>{
        result.info = e;
        res.json(result)
    })
}

// 评论点赞
let comment_like = (req, res)=>{
    let query = req.body;
    let whereStr = {
        _id:ObjectID(query.commentID),
    }

    // 返回数据
    let info = {
        fail: 'fail',
        fail_update: 'update fail',
        ok: 'ok',
        fail_like: 'fail like'
    }

    let result = {
        status: 0,
        info: info.fail,
        likes: undefined,
    }
    
    // 点赞
    like(collection_comment, whereStr, query.userID)
    .then(([rs, ls])=>{
         // 返回数据
        if(rs.modifiedCount !=0){
            result.status = 1;
            result.likes = ls.length;
            result.info = info.ok;
            res.json(result)
        }else{
            throw info.fail_like;
        }
    })
    .catch((e)=>{
        result.info = e;
        res.json(result)
    })
}


module.exports = {
    talk_like: talk_like,
    comment_like: comment_like,
}

