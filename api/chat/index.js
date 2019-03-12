let socket_io = require('socket.io');  

let socketio = {};  

let sk = require('./socket.js')

 
// 获取io
socketio.getSocketio = (server)=>{ // http(s) server
    let io = socket_io.listen(server);
    io.on('connection', (socket)=>{
        console.log('新加入一个连接。');
        // 处理事件
        sk.socket_do(socket, io);
    })
};

module.exports = socketio;


