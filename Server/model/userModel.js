import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
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
            // required:true,
        }
    },
    clerkid: {
        type: String,
        required:true
    }

},{timestamps:true});

const User = mongoose.model('User', userSchema);
export default User;