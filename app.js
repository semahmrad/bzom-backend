
import express, { urlencoded, json } from 'express';
const app =express()
import cors from 'cors'
import mongoose from 'mongoose';
const { connect } = mongoose;
import passport from 'passport';
import bodyParser from 'body-parser';

import userService from './services/user.services.js';
import signService from './services/sign.services.js';
import signUpValidator from './validators/signUpValidator.js';
import loadingApp from "./appLoading/loadingAppExtractData.js";


connect('mongodb://127.0.0.1:27017/bzomDb',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then((cn)=>{
    console.log("connected !");
}).catch((err)=>{
    console.log(err)
});


//require("./config/passport.js")(passport)
import {passportStrategy} from './config/passport.js';
passportStrategy(passport);




app.use(urlencoded({
    extended: false
}));
app.use(json());
app.use(cors());
//app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true 
  }));


app.use('/user',userService);
app.use('/sign',signService);
app.use('/signUpValidator',signUpValidator);
app.use('/loading',loadingApp);
/*












//use the user services



*/















app.listen(3000,()=>{console.log('server connected http://127.0.0.1:3000')});