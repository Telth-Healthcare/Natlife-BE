const mongoose=require('mongoose')

const connectdb=async()=>{
    try{
        const connected=await mongoose.connect(process.env.MONGO_URL)
        console.log('connected db')
    }catch(err){
        console.log('mongo connected error',err.message)
    }
}

module.exports=connectdb