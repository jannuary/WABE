/* 
    {
        userID: 
    }
    res: 
    {
        userName: 
        focusCount: // 关注数量
        fansCount:  // 粉丝数量
        sign: // 个性签名
    }

    访问关注信息时，可以是 userID 或者 userName
*/

const db = require('../../db')
const ObjectID = require('mongodb').ObjectID;   // 根据_id 查找用户

// 用户集合
let collection = "site";



// 输出用户信息路由
let userMsg = (req, res, next)=>{
    let query = req.body
   
    // 获得返回数据的信息
    let get = (query)=> {
        return new Promise(async (resolve, reject)=>{
            let udata = await getUserMsg(query);
            if(udata.length != 0){  // 如果用户存在
                // 用户基本信息
                let user = udata.shift();   
                // 用户粉丝与关注信息
                let fc = await getfcMsg(user._id.toString());
                resolve([user, fc])
            }else{  // 如果用户不存在
                reject()
            }
        })
    }

    // 返回数据
     let callResult = ([user, fcMsgs])=>{
        let result = {
            status: 1,
            userName: user.userName,    // 用户名
            sign: user.signature,       // 个性签名
            fans: fcMsgs[1].length,     // 粉丝数量
            focus: fcMsgs[0].length     // 关注数量
        }
        res.json(result)
    }
    
    get(query)
    .then(callResult)
    .catch(()=>{
        res.json({
            status: 0,
            info: 'get msg err'
        })
    })
}


// 获取用户基本信息
let  getUserMsg = (query)=>{
    return new Promise((resolve)=>{

        let whereStr = checkField(query);   // 检查字段

        if(!whereStr){  // 字段不符合则返回空
            resolve([])
        }else{  // 查找所有的信息
            db.find(collection, whereStr, (err, rs)=>{
                if(err){
                    console.log("User Msg err")
                    resolve([])
                }else{
                    resolve(rs)
                }
            })
        }
    })
};


// 用户的粉丝与关注信息
let getfcMsg = (id)=>{
    return new Promise( async (resolve)=>{
         // 获取用户关注与被关注
        const focus = require('../social/focus.js')

        // 获取关注数量
        let fcs = await focus.fcCount({ userID: id  })
        // 获取被关注数量
        let fceds = await focus.fcCount({ focus: id  })

        resolve([fcs,fceds])
    })
}


// 判断 id,userName 字段，合格返回查找条件
let checkField = (query) =>{
    let whereStr = {}
    if(query.userID != undefined){  // id 查找
        // 判断是不是标准的 _id
        let isObjectID = (id) => {
            let hex = new RegExp('^[0-9a-fA-F]{24}$');
            return (hex.test(id))? true : false;
        }
        
        if(isObjectID(query.userID)){
            whereStr._id = ObjectID(query.userID)
        }else{
            return false
        }
    }else if(query.userName != undefined){ // userName 查找
        whereStr.userName = query.userName;
    }else{  // 空则返回空
        return false
    }
    return whereStr;
}

// 结构
let MSG = {
    msg: userMsg,               // 输出用户信息路由
    getUserMsg : getUserMsg,    // 获取用户基本信息
    fcMsg: getfcMsg,            // 获取用户关注信息
}

module.exports = MSG
