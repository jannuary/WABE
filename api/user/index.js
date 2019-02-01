const db = require('../../db');  // 导入数据库连接
const app = require('express')();  // 路由
const ObjectID = require('mongodb').ObjectID;   // 根据_id 查找用户

const bodyParser = require('body-parser');
const multer = require('multer'); // v1.0.5
const upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

let result = {  // 返回的数据
    status: 0,
    info: null,
    userID: undefined
};

let info = {    // 信息字典
    err: '未知错误',
    err_key: '参数错误',
    user_exists: '该用户名已经存在',
    user_not_exists: '该用户不存在',
    err_password: '密码错误',
    ok: '成功',
    fail: '注销成功',   // 注销信息
}

const collection = "site";  // 集合
let res_result;     // 返回结果
let query;          // post的数据

// 解析post过来body的数据， post数据处理


// post数据处理
var legal_key = (req, res, next)=>{
    result = {  // 初始数据
        status: 0,
        info: null,
        userID: undefined
    };

    let url = req.baseUrl;
    query = req.body;
    console.log(query);

    res_result = ()=> res.json(JSON.stringify(result));

    // 字段判断
    if(query.userName == undefined || query.password == undefined) {
        result.info = info.err_key;
        res_result();
    }else
        next();
}
app.post(['/register','/login'], upload.array(),legal_key);

// 注册===========
{
app.post('/register',  (req, res, next)=>{
    // 是否已存在用户
    let whereStr = {"userName" : query.userName};

    db.find(collection,whereStr,(err, results)=>{ // 返回集合中所有数据
        if (err) {
            res.send(502);
        }
        else{
            if(results.length !=0){
                result.info = info.user_exists;
                res_result();
            }else next()
        }
    })
},(res, req)=>{
    let data = {"userName": query.userName,"password": query.password,"status":"1"};
    db.insertOne(collection, data, (err, results)=>{
        if (err) {
            res.send(502);
        }else{
            if(results.insertedCount ==1){
                result.status = 1;
                result.info = info.ok;
                result.userID = results.ops.shift()._id;
                res_result();
            }else{
                result.info = info.err;
                res_result();
            }
        }
    })
}
);
}

// 登陆============
{
app.post('/login', (res, req, next)=>{
    // 查询是否存在
    let whereStr = {'userName': query.userName};

    db.find(collection,whereStr,(err, results)=>{ 
        if (err) {
            res.send(502);
        }
        else{
            if(results.length !=0){ 
                // 登陆成功，更新登陆状态
                let rsl = results.shift();
                if(query.password != rsl.password){
                    result.info = info.err_password;
                    res_result();
                }else{
                    let updateStr = {$set: { "status" : "1" }};
                    
                    db.updateOne(collection, whereStr, updateStr,(err, _results)=>{
                        if (err) {
                            res.send(502);
                        } 
                        else{
                            result.status = 1;
                            result.info = info.ok;
                            result.userID = rsl._id;
                            res_result();
                        }
                    })
                }
                
            }else {
                result.info = info.user_not_exists;
                res_result();
            }
        }
    });
});
}

// 注销=============
{
// 注销返回的数据

app.post("/logout",
upload.array(), (res, req, next)=>{   // 字段判断
    result = {
        status : 0,
        info: 'fail',
    }

    query = res.body;
    
    if(query.userID == undefined){
        result.info = info.err_key;
        req.json(JSON.stringify(result));
    }
    else next()
},
(res, req)=>{ // 注销
    console.log("logout");
    console.log(query)
    
    let whereStr = { _id:ObjectID(query.userID) };
    
    db.find(collection,whereStr,(err, results)=>{ 
        if (err) {
            res.send(502);
        }
        else{
            if(results.length !=0){ 
                // 登陆成功，更新登陆状态
                let updateStr = {$set: { "status" : "0" }};
                db.updateOne(collection, whereStr, updateStr,(err, _results)=>{
                    if (err) {
                        res.send(502);
                    } 
                    else{
                        result.status = 1;
                        result.info = info.ok;
                        req.json(JSON.stringify(result));
                    }
                })
            }else {
                req.json(JSON.stringify(result));
            }
        }
    });
   
});
}


module.exports = app;