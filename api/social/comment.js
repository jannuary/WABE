/* 
    {
        userID:
        content:
        images:
        images:
        ...
    }

    返回
    {
        "status": 1,
        "info": "成功",
        "comment": {
            "userName": 
            "talkID": 
            "for": 
            "content": 
            "likes": 
            "created": 
            "commentID": 
        }
    }
*/

const db = require('../../db');    // 连接mongodb 
const ObjectID = require('mongodb').ObjectID;   // id 查找

let toComment = (req, res)=>{
    // 获取body 所有字段名
    let query = req.body;
    // 集合名字
    let collection = "social_comment";
    // 存储信息
    let data = {
        userName: null,
        talkID: query.talkID,
        for: query.for,
        content: query.content,
        likes: 0,
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
        comment: {}
    };


    // 查找用户名
    let user = require('../user/userMsg.js')
    user.getUserMsg(query)      // 查找用户名
    .then((userMsg)=>{
        if(userMsg.length != 0){
            data.userName = userMsg.userName;   // 获得用户名
            // 插入数据库
            db.insertOne(collection, data, (err, results)=>{
                if (err) {
                    res.send(502);
                }else{
                    if(results.insertedCount ==1){
                        result.status = 1;
                        result.info = info.ok;
                        data.commentID = data._id
                        delete data._id;
                        result.comment = data
                        //返回
                        res.json(result);
                    }else{
                        //返回
                        res.json(JSON.stringify(result));
                    }
                }
            })
        }else{
            res.json(result);
        }
    })

}

module.exports = {
    toComment: toComment,
}
