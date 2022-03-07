import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import User from "./../schema/user.js";
import bcryptjs from 'bcryptjs';
const { genSaltSync, hashSync, compare, compareSync } = bcryptjs;
const JWT_options = {};
JWT_options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
JWT_options.secretOrKey = "SRKxbUrUC8H3v4%*shuATBkZwhCQ^p=&6G!F8pz4+Jv*&Gg&a_v=68p2DXcHjq8mk_sMRdF2K#Yf3GE_@Hd@*$QWyQ3_h#5uYG%^P$J--nE_bL-NsE!sx@^";

export const passportStrategy= passport=>{
    passport.use(
        new JwtStrategy(JWT_options, async (jwt_payload, done) => {

            User.findById(jwt_payload.id).then((user) => {
                if (user) {
                    let user_payload = {
                        id: user._id,
                        email: user.email,
                        name: user.name.username
                    }
                    return done(null, user_payload);
                }
                return done(null, false);
            }).catch((err) => {
                console.log(err)
            });
        })
    );
}