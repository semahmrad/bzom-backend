
import User from './../schema/user.js'
import { Router } from "express";
import requestCountry from 'request-country'

//init the route
const router = Router();




 router.post("/emailAndUsername",async(req,res)=>{
    const username=req.body.username;
    const email=req.body.email;
   
    let lastResponse={
        code:200,
        msg:''
    }

    await User.findOne(
        {"name.username": username}
    ).then(user=>{
        if(user){
            lastResponse.code=400;
            lastResponse.msg='username used';
            //console.log(user)
        }
    }).catch(err=>{
        res.send(err);
    });
    await User.findOne(
        {"email.value": email}
    ).then(user=>{
        if(user){
            lastResponse.code=400;
            lastResponse.msg='email used'
            //console.log(user)
        }
    }).catch(err=>{
        res.send(err);
    });

    res.send(lastResponse);
    
});
router.get("/emailAndUsername",(req,res)=>{
    res.send('hey i am fine router ')
});

router.post("/concting",(req,res)=>{
    res.send('connected')
});



export default router;


