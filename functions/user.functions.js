
import  imagemin from 'imagemin'
import mozjpeg  from 'imagemin-mozjpeg';
import isJpg from 'is-jpg';
import fs from 'file-system';
import generator from 'generate-password'
import {verifAccountEmailBody} from './../mails/emailsBody.js'
import {sendGmail} from './../mails/gmail.js'
import nodemailer from "nodemailer";



const convertToJpg = async (input) => {
    if (isJpg(input)) {
        return input
    }
    return sharp(input).jpeg().toBuffer();
}

export const compressImg= async (buffer)=> {
    
    const miniBuffer = await imagemin.buffer(buffer, {
        plugins: [convertToJpg, mozjpeg({
            quality: 30
        })]
    })
    return miniBuffer;
   // console.log("mozjpeg",JSON.stringify(mozjpeg(monzjpegg)))
}

export const deleteImageFromServer= async (imagePath)=> {
    if(imagePath){
        fs.unlinkSync(imagePath.path)
    }
}
export const createVerificationCode = async ()=> {
    const dicimal=['0','1','2','3','4','5','6','7','8','9'];
    let secretCode='';
    let i=0;
    do{
        let index= Math.floor(Math.random() * 10);
        secretCode=secretCode+dicimal[index];
        i++
    }while(i<6)
    return secretCode;
}

export const SendVerifyEmail =(dest,username,secretCode)=> {

  
        sendGmail(dest,username,secretCode).then(() => {
        console.log("email is send", result)
    }).catch(error => console.log(error.message));
}

export const galleryToBase64 =(galleryArry)=> {
    let galleryPayload=[]
    let image={
        img_id:'',
        imageBase64:'',
        update:'',
    }
    galleryArry.forEach(imageObject => {
        image.imageId=imageObject._id
        image.update=imageObject.update;
        image.imageBase64=imageObject.image.toString('base64');
        galleryPayload.push(image);
    });
    return galleryPayload;
}

