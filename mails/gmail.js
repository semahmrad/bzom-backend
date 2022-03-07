import nodemailer from "nodemailer";
import  { google } from "googleapis";

import {VERIFY_ACCOUNT} from './../mails/emailsSubject.js';
import {verifAccountEmailBody} from './emailsBody.js'
/*const oAuth2Client = new google.auth.OAuth2('96287752088-3u54m9gpkhor9eshep3lg2lj47c6lu8h.apps.googleusercontent.com', 'KQhbMjAk-jbhH42nfn2_Dk30', 'https://developers.google.com/oauthplayground')
oAuth2Client.setCredentials({
    refresh_token:'1//04Hb4JO6exHKOCgYIARAAGAQSNwF-L9Irxnp_4Yehopaxf9c0vNfPAG3sYhjDOZXbVg9bM188Rtv-NVYHgE3MQUjtQHKB0QyLBok'
})*/

export const sendGmail = async (dest,username,secretCode) => {
    
        //const accessToken = await oAuth2Client.getAccessToken()
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "bzombeta@gmail.com",
                pass: "hesoyaM147"
            }
        });
        let message = {
            from: "bzomapp@bzom.com",
            to: dest,
            subject: VERIFY_ACCOUNT,
            html: verifAccountEmailBody(username,secretCode)
        }
        transporter.sendMail(message, function(err, info) {
            if (err) {
                console.log("err",err);
            } else {
                console.log(info);
            }
        });
}