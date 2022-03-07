
import User from './../schema/user.js';
import { Router } from "express";
import get_ip from 'ipware';
import geoip from 'geoip-lite';
const { lookup } = geoip;
import passport  from "passport";

//init the route
const router = Router();
export default router;



 router.post("/emailAndUsername",passport.authenticate("jwt", {session: false}),async(req,res)=>{
});
router.get("/loading",passport.authenticate("jwt", {session: false}),(req,res)=>{
   console.log(req. ip)
    res.send("lookup(127.0.0.1)")
});
