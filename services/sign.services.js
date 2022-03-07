import jwt from 'jsonwebtoken';
const { sign } = jwt;
import User from './../schema/user.js';
import bcryptjs from 'bcryptjs';
const { genSaltSync, hashSync, compare, compareSync } = bcryptjs;
import { Router } from "express";
import rateLimit from "express-rate-limit";
import fs from 'file-system';
import path from 'path'
const { readFileSync, statSync } = fs;
import multer from 'multer';

import  {compressImg,deleteImageFromServer,createVerificationCode,SendVerifyEmail} from "../functions/user.functions.js";
import { createBrotliCompress } from 'zlib';
import lockup from 'geoip-lite'

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads');
    },
    filename:(req,file,cb)=>{
        cb(null,new Date().toString().replace(/:/g,'_')+'_'+file.originalname+".jpg")
    }
});
const filefilter=(req,file,cb)=>{
    if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||
    file.mimetype==='image/jpeg'){
        cb(null,true);
    }
    else{cb(null,false);}
}
const upload=multer({
    storage:storage,
    fileFilter:filefilter,
    limits:10*1024*1024,
})




//init the route
const router = Router();
export default router;

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100 // limit each IP to 6 login requests/ 15 min 
});



router.post("/up", upload.single('profilePic'),async (req, res) => {
    
   
try{
        let salt = genSaltSync(10);
        let hashPassword = hashSync(req.body.password, salt);
        let imgData=readFileSync(req.file.path);
        let stats = statSync(req.file.path);
        let imgSizeInBytes = stats.size;
        let imgSizeInMegabytes = imgSizeInBytes / (1024 * 1024);
        let secretCode=await createVerificationCode();
        let username=req.body.username;
        let firstName=req.body.firstName;
        let lastName=req.body.lastName;
        let email=req.body.email;
        let birthday=req.body.birthday;
        let age=req.body.age;

    if(hashPassword&&imgData&&req.file&&username&&firstName&&lastName&&email&&birthday&&age){

        if (imgSizeInMegabytes > 5) {
            res.send("image too big");
            deleteImageFromServer(req.file)
            
        }else {
            console.log("size before compress => " + imgData.toString().length)
            let minibuffer = await compressImg(imgData);
            console.log("size after compress => "+minibuffer.toString().length);

            const newUser = new User({
                name: {
                    username:req.body.username,
                    firstName:req.body.firstName,
                    lastName:req.body.lastName,
                },
                email: {value:req.body.email},
                birth: {
                    birthday:req.body.birthday,
                    age:Number(req.body.age),
                },
                
                password: {
                    value:hashPassword
                },
                gender: req.body.gender,
                address:{
                    country:'Tunisia'
                },
                profilePic:minibuffer,
                created_date: Date.now(),
                secretCode,
                //secretCode,
                oviv_currency: 100,
            });
         
            await newUser.save().then((user) => {
               

                const payload = {
                    id: user._id
                };
                const userPayload = {
                    idInBd: user._id,
                    profilePic:user.profilePic.toString('base64'),
                };
                sign(payload,"SRKxbUrUC8H3v4%*shuATBkZwhCQ^p=&6G!F8pz4+Jv*&Gg&a_v=68p2DXcHjq8mk_sMRdF2K#Yf3GE_@Hd@*$QWyQ3_h#5uYG%^P$J--nE_bL-NsE!sx@^",{},async(err,token)=>{
                    if(err){
                        res.json({
                            code:400,
                            msg:'error to create token'
                        });
                    }
                    //send mail verification 
                    
                    else{
                    
                        SendVerifyEmail(user.email.value,user.name.username,user.secretCode);
                        res.json({
                            code: 200,
                            msg: 'user created and email veryfication sended',
                            token:token,
                            userPayload,
                        });
                    
                    }
                    

                });
                deleteImageFromServer(req.file)
            }).catch((err) => {
                console.log('err',err)
                if(err.code==11000){
                console.log("username or email are exsite")
                res.send("username or email are exsite");
                
            
            }
                else{
                    
                // deleteImageFromServer(req.file.path)
                    res.send(err);
                }
                deleteImageFromServer(req.file)
            });
    
            //deleteImageFromServer(req.file.path)
        }
        
    }
    else{
        res.json({
            code:501,
            msg:'problem'
        });
    }
        
}catch(err){
    console.log('req.file.path')
    
        deleteImageFromServer(req.file);
        
    
    res.send(err)
}
});

router.post("/in", loginLimiter, (req, res) => {
    const authenticator =req.body.authenticator;
    const password =req.body.password;
    
    User.findOne().or([{
        "email.value": {
            "$in": [authenticator]
        }
    }, {
        "name.username": authenticator
    }]).then((user)=>{
        if(user){
            compare(password,user.password.value).then((isMatch)=>{
               if(isMatch){
                const payload = {
                    id: user._id
                };
                sign(payload,"SRKxbUrUC8H3v4%*shuATBkZwhCQ^p=&6G!F8pz4+Jv*&Gg&a_v=68p2DXcHjq8mk_sMRdF2K#Yf3GE_@Hd@*$QWyQ3_h#5uYG%^P$J--nE_bL-NsE!sx@^",{},async(err,token)=>{
                    if(err){
                        res.json({
                            code:400,
                            msg:'error to create token'
                        });
                    }
                    let user_payload = {
                        firstName:user.name.firstName,
                        lastName:user.name.lastName,
                        birthday:user.birth.birthday,
                        gender:user.gender,
                        profilePicture:user.profilePic.toString('base64'),
                    }
                    //console.log('just test===>',req.user)
                    res.json({
                        code: 200,
                        msg:'user login',
                        token:token,
                        isVerify:user.isVerified,
                        userPayload:user_payload,
                    });
               
                });
               }
               else if(user.password.oldValue){
                   if(compareSync(password,user.password.oldValue)){
                    
                       res.json({
                           code:200,
                           msg: `This is your old password You change it in : ${user.password.update}`
                       });

                   }else{
                        res.json({
                            code: 400,
                            msg: "Your password is Wrong!"
                        });
                   }
               }
               else{
                   res.json({
                        code: 400,
                        msg: "Your password is Wrong!"
                   });
               }
            });
        }else{
            res.json({
                code: 404,
                msg: "User not found !"
            });
        }

    });

});




