// userController.js
//needed for web token authentication
import config from '../config/auth.config.js';
import jwt from 'jsonwebtoken';

/**
* Handle login user action, when a user visits /login with a POST
* @param req - the form data sent with the request
* @param res - the result to send back to the user
*/
export const login = function(req,res){
//normally we look for the user in a database here
//check login details, return token if they are logged in
    if(req.body.username != "test"){
        return res.status(401).send({message: "user not found."});
    }
    if(req.body.password =="test"){
        //generate a token which the user can use in future API calls
        //in a proper implementation, the secret key would be kept in a separate file!
        var token = jwt.sign({id:req.body.username}, config.secret, {expiresIn:86400});
        res.status(200).send({message:"Login successful", accessToken:token})
    }else{
        return res.status(401).send({message:"Invalid password"});
    }
}

export const admin = function(req,res){
    //we could do something here, like get all the users from the database and
    //add them to the JSON being returned
    res.status(200).json({
        status: "success",
        message: "Admin area reached successfully"
    })
}