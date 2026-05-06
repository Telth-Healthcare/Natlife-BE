const express=require('express')
const router=express.Router()


const auth=require('./auth.controller');
const {protect,authorise}=require('./auth.middleware');


router.post('/register',auth.register)
router.post('/login',auth.login)
router.post('/refresh',auth.refresh)
router.post('/logout',auth.logout)

router.get('/profile',protect,(req,res)=>{
    res.json({msg:'Admin-Only'})
})

module.exports=router
















