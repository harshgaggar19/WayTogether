import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    },
    email: {
        type: String,
        required:true
    },
    preference: {
        genderPreference: {
            type:String,
        },
        agePreference: {
            type:Number,
        }
    },
    currentLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required:true
        },
        coordinates: {
            type: [Number],
            required:true,
        }
    }

})

const User = mongoose.model('User', userSchema);
export default User;