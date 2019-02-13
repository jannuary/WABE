// 判断是否合法
let legal_key = (query)=>{
    console.log('leg')
    console.log(query)
    if(query.userID==undefined || query.content==undefined){
        return false;
    }else
        return true;
}

const talk = {
    legal: legal_key,
}

module.exports = talk;