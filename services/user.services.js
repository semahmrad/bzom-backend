import bcrypt from "bcryptjs";
import { Router } from "express";
import User from '../schema/user.js';
import passport  from "passport";
import fs from 'file-system';
const { readFileSync, statSync } = fs;
import multer from 'multer';
import  {compressImg,deleteImageFromServer,createVerificationCode,SendVerifyEmail} from "../functions/user.functions.js";

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
    limits:5*1024*1024,
})

//init the router 

const router = Router();
router.use(passport.authenticate("jwt", {session: false}))


router.post("/jwtTest", (req, res) => {   
        res.send('just test the route');
});




router.post("/add", (req, res) => {
    
 
    const user =new User({
        username:'username',
        password:'password'
    });
    
    user.save();
    res.send("hi")
});
router.post("/verify/account",async(req, res) => {
    try{
        let userId=req.user.id;
        let secretCode =req.body.secretCode;
       
        await User.findOne({
            _id:userId
        }).then(userFinded=>{
            if(secretCode==userFinded.secretCode){
                 User.updateOne({_id:userId},{isVerified:true}).then(verify=>{
                    res.json({
                        code:200,
                        msg:'isverify'
                    });

                }).catch(err=>{
                    res.json({
                        code:501,
                        msg:'problem in verification ur account !!'
                    });
                });
                
              
            }else{
                res.json({
                    code:400,
                    msg:'not verify'
                });  
            }
            
        }).catch(err=>{
            res.json({
                code:500,
                msg:JSON.stringify(err.message)
            })
        });
      
    }catch(err){
        res.send('err',err);
    }
    
});


router.post("/change/profile/picture",upload.single('newProfilePic'), async (req, res) => {
    let userId=req.user.id;
    let imgData=readFileSync(req.file.path);
    let stats = statSync(req.file.path);
    let imgSizeInBytes = stats.size;
    let imgSizeInMegabytes = imgSizeInBytes / (1024*1024);
    if(userId&&imgData&&stats&&imgSizeInBytes){
       console.log(imgSizeInBytes)
        if(imgSizeInMegabytes>5){
            res.json({
                code:401,
                msg:'image too big ..!'
            });
            console.log('image too big')
           // deleteImageFromServer(req.file);
        }else{
            let minibuffer = await compressImg(imgData);

            await User.updateOne(
                {_id:userId},
                {profilePic:minibuffer}
            ).then(modifydata=>{
                res.json({
                    code:200,
                    msg:'Successful Change Images',
                    newPicture:minibuffer.toString('base64'),
                });
              console.log('modify')  
            }).catch(err=>{
                res.json({
                    code:501,
                    msg:'problem to change this picture'
                })
            });
        }
       
        deleteImageFromServer(req.file)
    }
    else{res.json({code:100,msg:'problem'});}
});

router.post("/add/picture", upload.single("newPic"),async(req, res) => {
    let imgData = fs.readFileSync(req.file.path)
    //imgDesc = req.body.textPic;
    let stats = fs.statSync(req.file.path)
    let imgSizeInBytes = stats.size;
    let imgSizeInMegabytes = imgSizeInBytes / (1024 * 1024);
    if (imgSizeInMegabytes > IMAGE_MAX_SIZE) {
        res.send("image too big")
    }else {
        User.findById(req.user.id).then(async user => {
            console.log(user.gallery.length)
            if (user.gallery.length < 5) {
                console.log("size before compress => " + imgData.toString().length)
                minibuffer = await compressImg(imgData);
                let newImgData = {
                    imageContent: minibuffer,
                    update: req.body.action_date
                }
                user.gallery.push(newImgData);
                user.save().then(() => {
                    res.json({
                        code: STATUES.OK,
                        msg: "image uploaded",
                    });
                }).catch(err => res.send(err))
            } else res.json({
                code: STATUES.NOT_VALID,
                msg: "you can not upload anymore images"
            });
        }).catch(err => res.send(err))
    }
       
        res.send("hi")
    });

    router.post("/add/picture/test", upload.single("newPic"),async(req, res) => {
        let imgData = fs.readFileSync(req.file.path)
        //imgDesc = req.body.textPic;
        let stats = fs.statSync(req.file.path)
        let imgSizeInBytes = stats.size;
     

            await User.findById(req.user.id).then(async user => {
                console.log('then')
                console.log(user.gallery.length)
                if (user.gallery.length < 5) {
                    
             
                    let minibuffer = await compressImg(imgData);
                    let newImgData = {
                        imageContent: minibuffer,
                        //update: req.body.action_date
                    }
                    user.gallery.push(newImgData);
                    user.save().then(() => {
                        
                        res.json({
                            code: 200,
                            msg: "image uploaded",
                        });
                    }).catch(err => {console.log('iam her1');res.send(err);})
                } else res.json({
                    code: 500,
                    msg: "you can not upload anymore images"
                });
            }).catch(err => {console.log('iam her2');res.send(err.message)})
        
           
           
        });
export default router

    

