const db = require('../../db');  // 导入数据库连接
const app = require('express')();  // 路由
const ObjectID = require('mongodb').ObjectID;   // 根据_id 查找用户

const bodyParser = require('body-parser');
const multer = require('multer'); // v1.0.5
const upload = multer(); // for 分析 multipart/form-data

app.use(bodyParser.json()); // for 分析 application/json
app.use(bodyParser.urlencoded({ extended: true })); // for 分析 application/x-www-form-urlencoded

let query;

// 解析数据
app.post("/*", upload.array());

// 说说========
const talk = require('./talk.js');

let result // 返回数据
let info = {
    fail: '失败',
    ok: '成功',
}
app.post('/a',(req, res)=>{
    res.send('sdf');
})

app.post("/talk",(req, res, next)=>{
    result = {  // 返回数据
        status : 0,
        info: info.fail,
    }

    // 储存传过来的数据
    query = req.body;

    // 检测字段是否合法
    if(!talk.legal(query)){
        res.json(JSON.stringify(result));
        return;
    }
    next();
},(req, res)=>{
    let collection = "social_talk";
    let data = {
        "userID": query.userID,
        "content": query.content
    }

    // 插入数据
    db.insertOne(collection, data, (err, results)=>{
        if (err) {
            res.send(502);
        }else{
            if(results.insertedCount ==1){
                result.status = 1;
                result.info = info.ok;
        res.json(JSON.stringify(result));
            }else{
        result.info = info.err;
        res.json(JSON.stringify(result));
        
            }
        }
    })
    
});

app.post('/x',(req, res)=>{
    
    res.sendFile('../../public');
});


module.exports = app;