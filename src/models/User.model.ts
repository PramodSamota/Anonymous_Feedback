import mongoose, {Schema,Document} from "mongoose";


export interface Message extends Document {
    content: string;
   createdAt:Date;
}


const messageSchema:Schema<Message> = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


export interface User extends Document {
    username: string;
    email: string;
    password: string;
    isVerified?:boolean;
    verifyCode?:string;
    verifyCodeExpiry?:Date;
    isAcceptingMessage?:boolean
    messages: Message[]
}
const userSchema:Schema<User> = new mongoose.Schema({
    username: {
        type: String,
        required: [true,"username is required"],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true,"email is required"],
        unique: true,
        match: [/.+@.+\..+/,"email is invalid"],
    },
    password: {
        type: String,
        required: true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    verifyCode: {
        type: String,
        
    },
    verifyCodeExpiry: {
        type: Date,
        
    },
    isAcceptingMessage: {
        type: Boolean,
        default: false
    },
    messages: [messageSchema]
})


const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User",userSchema)

export default UserModel