import jwt from 'jsonwebtoken'
import config from '../config/auth.config.js'
/**
* Called when the user makes a request that requires them to be loged in
* Allows the next handler to be called if everything is fine
* @param req The data containing the token in the header
* @param res The result to send any problems back to.
* @param next The function to call if everything passes
*/

const verifyToken = (req,res,next)=>{
    let token = req.headers["x-access-token"];
        if(!token){
        return res.status(401).send({message:"No token provided"});
        }
    //validate the token using the JWT module
    jwt.verify(token, config.secret, (err, decoded) =>{
        if(err){
            return res.status(401).send({message:"Unauthorised, invalid token."});
        }
        //save the username from the decoded token (incase we need it!) and call next()
        req.username = decoded.id;
        next();
    });

}

export default verifyToken;