const Redis=require('ioredis')
const redis=new Redis({
    host:'127.0.0.1',
    port:6379
})

redis.on('connect',()=>console.log("redis conencted"))
redis.on('error',()=>console.log('redis eror',err.message));

module.exports=redis









