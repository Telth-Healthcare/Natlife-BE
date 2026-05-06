const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken');
const {v4:uuidv4}=require('uuid')


const User=require('./auth.model');
const session=require('./session.model');
const redis = require('../../config/redis');

const generateTokens=(user)=>{
   const accessToken=jwt.sign(
    {id:user._id,role:user.role},
    process.env.JWT_SECRET,
    {expiresIn:'15m'}
   )
   const refreshToken=uuidv4();
   return{accessToken,refreshToken};
   
}

exports.register = async(req,res)=>{
    try{
        const {name,email,password}=req.body
        const hashed= await bcrypt.hash(password,6);
        const user=await User.create({name,email,password:hashed});
        res.json({message:'user creaetd'})

    }catch(error){
        res.json(error)
        console.log(error)
    }
}

exports.login=async(req,res)=>{
    const {email,password}=req.body
      try{
        const Existinguser=await User.findOne({email});
        if(!Existinguser) return res.status(400).json({msg:'User not found'})

            const isMatch=await bcrypt.compare(password,Existinguser.password)
            if(!isMatch) return res.status(400).json({msg:"invalid credentials"})

                const {accessToken,refreshToken}=generateTokens(Existinguser)
                const sessionKey=`session:${refreshToken}`;
                 
                await redis.set(
                    sessionKey,
                    JSON.stringify({
                        userId:Existinguser._id,
                        userAgent:req.headers['user-agent'],
                        ip:req.ip
                    }),
                    'EX',
                    60
                )
                res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: false,   // true in production
  sameSite: 'strict'
});

                res.json({accessToken})

      }catch(err){
         res.status(500).json({message:"failed to login",error:err.message})
      }
}

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ msg: 'No refresh token' });
  }

  const sessionKey = `session:${refreshToken}`;

  const session = await redis.get(sessionKey);

  if (!session) {
    return res.status(403).json({ msg: 'Invalid session' });
  }

  const parsed = JSON.parse(session);

  const user = await User.findById(parsed.userId);

  const tokens = generateTokens(user);

  // 🔥 rotate token
  await redis.del(sessionKey);

  const newKey = `session:${tokens.refreshToken}`;

  await redis.set(
    newKey,
    JSON.stringify(parsed),
    'EX',
 120
  );

  // 🔥 update cookie with new refresh token
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  });

  res.json({ accessToken: tokens.accessToken });
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const sessionKey = `session:${refreshToken}`;

  await redis.del(sessionKey);

  res.clearCookie('refreshToken');

  res.json({ msg: 'Logged out' });
};