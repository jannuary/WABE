/* 
    {
        userID: 
        sign: 
    }
    res:
    {
        status:
        info: 
        sign: 
    }
*/
const db = require('../../db');  // 导入数据库连接
const ObjectID = require('mongodb').ObjectID;   // 根据_id 查找用户

// 集合
let collection = "site"

// 个性签名
let sign = (req, res, next)=>{
    let query = req.body
    console.log(query)
    
    // 字典
    let info = {
        fail: "fail",
        ok: "ok"
    }

    // 返回数据
    let result = {
        status: 0,
        info: info.fail,
        sgin: undefined
    }

    // 更新
    let whereStr = {
        _id : ObjectID(query.userID)
    }

    let newSign = query.sign.replace(/(^\s*)|(\s*$)/g, "");
        newSign = newSign == "" ? null : newSign;
    let updated = {
        $set : {
            signature : newSign
        }
    }

    db.updateOne("site", whereStr, updated, (err, rs)=>{
        if(err){
            res.json(result)
        }else{
            result.status = 1;
            result.info = info.ok;
            result.sign = newSign;
            res.send(result)
        }
    })
}


module.exports = {
    sign : sign
}