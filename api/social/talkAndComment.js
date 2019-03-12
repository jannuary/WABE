/* 
    {
        userID:
        page: 获得分页
    }

    {
        
    }
*/
const db = require('../../db');    // 连接mongodb 
const ObjectID = require('mongodb').ObjectID;   // id 查找

// 集合
let colTalk = "social_talk";
let colComment = "social_comment";

// 按时间降序排列
let sort = {    // 按创建时间降序
    created: -1
}

// 查找所有说说
let talks = ()=>{
    return new Promise((resolve, reject)=>{
        db.findAndSort(colTalk,null,sort,(err, talkrs)=>{ 
            if (err) {
                reject('talk err')
            }else{
                resolve(talkrs)
            }
        })
    })
}

// 查找自己关注
let fcs = (whereStr)=>{
    return new Promise((resolve)=>{
        let fc = require('./focus.js');
        resolve(fc.fcCount(whereStr))
    })
} 

// 查找所有评论
let comment = ()=>{
    return new Promise((resolve, reject)=>{
        db.findAndSort(colComment,null,sort,(err, talkrs)=>{ 
            if (err) {
                reject('talk err')
            }else{
                resolve(talkrs)
            }
        })
    })
}

// 返回所有数据
let ret = async (quserID)=>{
    // 获得所有相关数据
    let talkrs = await talks();   // 说说
    let _fcs = await fcs({userID: quserID});   // 关注
    let comrs = await comment();  // 评论

    const user = require('../user/userMsg.js');
    let fuserN = await user.getUserMsg({ userID: quserID });
    let fName = fuserN.shift().userName;

    // 返回所有说说的内容
    let arrTalk = new Array(0);
    
    // 返回喜欢的人数，是否已经喜欢
    let lk = (likeStr, userID)=>{
        let   ls = likeStr == 0 || likeStr == undefined? [] : likeStr.split('|');
        let retStatus = {
            count: ls.length,       // 喜欢的人
            islike: ls.some((id)=>{ return id == userID })    // 是否已经喜欢
        }
        return retStatus;
    }
    
        // 循环获取数据
        talkrs.forEach((talk)=>{
            let likeMsg = lk(talk.likes, quserID);
            
            // 查找说说相应的评论
            let coms = comrs.filter((c)=> {return c.talkID == talk._id });
            // 返回的数据
            let talk_comment={
                talkID: talk._id,
                userName: talk.userName,
                content: talk.content,
                images: talk.images ==null ? null : talk.images.split('|'),
                created: talk.created,
                likes: likeMsg.count,
                liked: likeMsg.islike,
                focus: _fcs.some((c)=> {return c.focusName == talk.userName || c.focusName == fName }),
                commentCount: coms.length,
                comment: coms, // 查找说说相应的评论
            };
            for (let i = 0; i < talk_comment.comment.length; i++) {
                likeMsg = lk(talk_comment.comment[i].likes, quserID);
                talk_comment.comment[i].commentID = talk_comment.comment[i]._id;
                talk_comment.comment[i].likes = likeMsg.count;
                talk_comment.comment[i].liked = likeMsg.islike;
                delete talk_comment.comment[i]._id;
                delete talk_comment.comment[i].talkID;
            }
            arrTalk.push(talk_comment);  
        })
    return(arrTalk)
}




let showTalkComment = (req, res)=>{
    // 接收请求的数据
    let query = req.body;

    
    // 每次返回说说的数量
    let Num = 10;

    // 获得所有数据，并处理数据
    let getMsg = async (id, page)=>{

        let data = await ret(id)   // 获得没有排序数据

        // 排序数据, 获得自己关注过的
        let fceds = data.filter((d)=> { return d.focus; } )
        let nfceds = data.filter((d)=> { return !d.focus; } )

        // 将两个数据加在一起
        fceds.push.apply(fceds , nfceds);
        // 截取数据的第一个下标
        if(page<0 || page ==undefined){
                page = 1;
        }

        let top = (page-1)*Num;
        if(top <0 || top > fceds.length-1 ){
            top = 0;
        }

        
        res.send( fceds.slice(top, top +Num) );
    }
    getMsg(query.userID, query.page)
}

// 热门模块
let hotTalkComment = (req, res)=>{
    // 接收请求的数据
    let query = req.body;

    // 每次返回说说的数量
    let Num = 10;

    // 获得所有数据，并处理数据
    let getMsg = async (id, page)=>{

        let data = await ret(id)   // 获得没有排序数据

        // // 排序数据, 获得自己关注过的
        let sortTalk = (a, b)=>{
            return b.likes - a.likes
        }

        data.sort(sortTalk);
        let fceds = data;
        
        // 截取数据的第一个下标
        if(page<1 || page ==undefined){
                page = 1;
        }

        let top = (page-1)*Num;
        let retn;

        if(top <0 || top > fceds.length-1 ){
            retd = fceds.slice(0,0)
        }else{
            retd = fceds.slice(top, top +Num)
        }

        res.send( retd );
    }
    getMsg(query.userID, query.page)
}

// 个人动态
/* 
    {
        userID:
        showName: 展示者的名字
    }
*/
let showperson = (req, res)=>{
     // 接收请求的数据
     let query = req.body;

     // 每次返回说说的数量
     let Num = 5;

     // 被展示人的名字
     let shower = query.showName || null;
     // 获得所有数据，并处理数据
     let getMsg = async (id, page)=>{
        
        // 获得没有排序数据
        let data = await ret(id)   
 
        // 排序数据, 获得自己关注过的
         let fceds = data.filter((t)=>{
             return t.userName == shower
         }) ;
         
         // 截取数据的第一个下标
         if(page<1 || page ==undefined){
                 page = 1;
         }
 
         let top = (page-1)*Num;
         let retn =  {  // 返回数据
            focus: null,
            fan: null,
            talk: undefined
        } ;

         if(top <0 || top > fceds.length-1 ){
             retd = fceds.slice(0,0)
         }else{
             retd = fceds.slice(top, top +Num)
         }
        
        // 获得关注信息
        const user = require('../user/userMsg.js')
        let fuserID = await user.getUserMsg({ userName: shower });
        let fid = fuserID.shift();
        
        if(fid._id != undefined){
            let getfc = await user.fcMsg(fid._id.toString());
            retn =  {  // 返回数据
                focus: getfc[0].length,
                fan: getfc[1].length,
                talk: retd
            };
            res.send(retn);
        }else{
            res.send({})
        }
     }
     getMsg(query.userID, query.page)
}

module.exports = {
    show: showTalkComment,      // 展示所有的说说
    showhot: hotTalkComment,    // 热门
    showperson: showperson,     // 展示个人的动态
}




