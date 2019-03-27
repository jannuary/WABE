const _ = require('underscore');

// 连接用户的基本信息
const userMsg = require('../user/userMsg.js');

// 储存上线的用户 [sender => socketid]
let onlineName = new Map();

// 储存未接收信息的用户 [ receiver ]
let outlineName = new Set();

// 信息
let msg =new Set();


// 处理接收时的事件
let socket_do = (socket, io)=>{

    // 接收未接收的信息，即离线时的信息
    // 将未接收的信息转化为数组
    socket.on('unreceived', function (data) {
        let userID = data.userID

        // 储存上线的用户
        onlineName.set(userID,socket.id);

        console.log(onlineName);

        // 刚开始连接的时候，查找自己未接收的信息
        let sendmsg = Array.from(msg)
        sendmsg.forEach((x)=>{  // 查找自己的信息
            if( x.receiver == userID ){
                // 发送
                socket.emit("msg",x);
                // 删除
                msg.delete(x)
            }
        })
    })


    // 给特定的用户发信息
    socket.on('msg', function (data) {
        var sender = data.userID;   
        var receiver = data.to;
        var chat = data.msg;
        
        // 返回信息
        let m = {
            sender: sender,
            receiver: receiver,
            content: chat,
            created: (new Date).getTime(),
        }

        // 储存上线的用户
        onlineName.set(sender,socket.id);

        // 获取接收者的 socket id, 如果不在线, 则存储起来
        let toId = onlineName.get(receiver) == undefined ? false : onlineName.get(receiver);

        if(toId){
            // nodejs的underscore扩展中的findWhere方法，可以在对象集合中，通过对象的属性值找到该对象并返回。
            let toSocket = _.findWhere(io.sockets.sockets, {id: toId});
           

            // 通过该连接对象（toSocket）与链接到这个对象的客户端进行单独通信
            if(toSocket != undefined){
                toSocket.emit('msg', m);
            }
            
        }else{  // 存储接收者
            // 储存未接接收人的id
            outlineName.add(receiver);
            /* 
             打开数据库，将未接收的数据储存进去。
            */
            
            msg.add(m)

        }
        
    });

    // 匹配, 使用的是随机的分配
    socket.on('match',(data)=>{
        let size = onlineName.size;
        let persons = Array.from(onlineName);
        let rand = ()=>{
            return (Math.floor(Math.random()*size));
        }
        
        // 返回的数据
        let res = {
            status: 0,
            matchUserID: undefined,
            matchUserName: undefined,
            info: undefined,
        }
        console.log(onlineName)
        
        if(size >1 ){  // 如果在线人数2个以上，才进行匹配返回
            let rd = rand();
            let i=0;        // 防止死循环
            while(persons[rd][1] == socket.id && i++ !=20){
                rd = rand();
            }
            

            userMsg.getUserMsg({
                userID: persons[rd][0],
            })
            .then(msg=>{
                if(msg.length!==0){
                    res = {
                        status: 1,
                        matchUserID: persons[rd][0],
                        matchUserName: msg[0].userName,
                    }
                }else{
                    res.info = "user err.";
                }
                socket.emit("match",res);
            })
        }else{
            res.info = "no people online.";
            socket.emit("match",res);
        }
    })

    // 当关闭连接后触发 disconnect 事件
    socket.on('disconnect', function () {
        console.log('\n断开一个连接。');
        
        // 删除在线的信息
        onlineName.forEach((val, key, map)=>{
            if(val == socket.id){
                onlineName.delete(key)
                return
            }
        })
    });

    // 广播所有用户
    // let news = "io.emit: hello"
    // io.emit('news',news)

    // socket.emit() ：向建立该连接的客户端广播
    // socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
    // io.sockets.emit() ：向所有客户端广播，等同于上面两个的和
}



module.exports = {
    socket_do: socket_do
}

