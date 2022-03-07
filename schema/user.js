import pkg from 'mongoose';
const { Schema, model } = pkg;


const userSchema = Schema({
    name: {
        username: {
            type: String,
            unique: true,
            //required: true,
            trim: true,
            index: true,
            minLength: 5,
            maxLength: 20,
        },
        lastName: {
            type: String,
            trim: true,
            minLength: 2,
            maxLength: 20,
           
        },
        firstName: {
            type: String,
            trim: true,
            minLength: 2,
            maxLength: 20,
           
        }
    },
    email: {
        value: {
            type: String,
           // required: true,
            unique: true,
            trim: true,
            index: true,
            
        },
        update: {
            type: Date,
            default: Date.now
        }
    },
    password: {

            value: {
                type: String,
                // required: true,
                 index: true,
                 minLength: 8
                
            },
            oldValue: {
                type: String
            },
            update: {
                type: Date,
                default: Date.now
            }
    },
    birth: {
        birthday: {
            type: Date /*, required: true */
        },
        age: {
            type: Number
        },
        update: {
            type: Date
        }
    },
    gender: {
        type: String /*, required: true */
    },
    phone: {
        value: {
            type: String,
        },
        dialing_code:{
            type:String,
        },
        update: Date
    },
    address: {
        country: {
            type: String,
            /*required: true,*/
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        state_district: {
            type: String,
            trim: true
        },
        county: {
            type: String,
            trim: true
        },
        road: {
            type: String,
            trim: true
        },
        postcode: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        boundingbox: {
            lat1: {
                type: String
            },
            lat2: {
                type: String
            },
            long1: {
                type: String
            },
            long2: {
                type: String
            },
        },
        country_code: {
            type: String
        },
        town: {
            type: String
        },
        village: {
            type: String
        },
        update: {
            type: Date
        }
    },
    profilePic:{
        type:Buffer,
        contentType: String,
        //required: true,
    },
    gallery: [
        {
           image:{
               imageContent:{
                type:Buffer,
                contentType: String,
               },
           },
           update:Date,
        },
    ],

    connection: [{
        lat: String,
        long: String,
        device: String,
        system: String,
        connected_at: {
            type: Date
        },
        connection_duration: String,
        isActive: Boolean
    }],
    secretCode: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    blockedUsers: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    education: {
        type: String,
        minLength: 6
    },
    work: {
        type: String,
        minLength: 6
    },
    
    message_box: [{
        type: Schema.Types.ObjectId,
        ref: "discussion"
    }],
    created_date: {
        type: String,
    },
    oviv_currency: Number,
    isOnline: Boolean
});

const User = model("user", userSchema);
export default User;