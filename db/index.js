
const dbname = "wise"

const MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = `mongodb://120.79.95.188:27017/${dbname}`;

// let collection = "site";


let MongoClient_connect = (callback)=>MongoClient.connect(DB_CONN_STR, { useNewUrlParser: true }, (err, db)=>{
    if (err) throw err;
    var dbo = db.db(dbname);
    callback(dbo);
    db.close();
});

let curd = {
    find : (collection, whereStr, callback)=>MongoClient_connect(
      (dbo)=>dbo.collection(collection). find(whereStr).toArray(callback)
    ),

    findAndSort : (collection, whereStr, sort, callback)=>MongoClient_connect(
        (dbo)=>dbo.collection(collection). find(whereStr).sort(sort).toArray(callback)
    ),

    insertOne : (collection, data, callback)=>MongoClient_connect(
        (dbo)=>dbo.collection(collection).insertOne(data,callback)
    ),

    updateOne : (collection, whereStr, updateStr, callback)=>MongoClient_connect(
        (dbo)=>dbo.collection(collection).updateOne(whereStr, updateStr, callback)
    ),

    deleteOne : (collection, whereStr, callback)=>MongoClient_connect(
        (dbo)=>dbo.collection(collection).deleteOne(whereStr, callback)
    ),

    deleteMany : (collection, whereStr, callback)=>MongoClient_connect(
        (dbo)=>dbo.collection(collection).deleteMany(whereStr, callback)
    ),

    // 左连接
    aggregate : (collection, whereStr, callback)=>MongoClient_connect(
        (dbo)=>dbo.collection(collection).aggregate([lookup]).toArray(callback)
    ),
}


module.exports = curd;






