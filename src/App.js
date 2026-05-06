const express=require('express')
const cookieParser = require('cookie-parser');
const morgan=require('morgan')
const app=express()


app.use(express.json())
app.use(cookieParser());
app.use(morgan('dev'))


app.use((req, res, next) => {
  const safeBody = { ...req.body };

  if (safeBody.password) {
    safeBody.password = '****';
  }

  console.log({
    method: req.method,
    url: req.originalUrl,
    body: safeBody
  });

  next();
});

const authRoutes=require('./modules/auth/auth.routes')

app.use('/api/auth',authRoutes)

app.get('/test',(req,res)=>{
    res.send("Backend is running")
})

module.exports=app