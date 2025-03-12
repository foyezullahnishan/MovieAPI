//userModel.js
import mongoose from 'mongoose';
//setup schema
const userSchema = mongoose.Schema({
    username:{type:String,required:true,},
    password:{type:String,required:true,}
})
//export user model
const User = mongoose.model('user', userSchema);

export const get = function(callback, limit){
    User.find(callback).limit(limit)
}
export default User;