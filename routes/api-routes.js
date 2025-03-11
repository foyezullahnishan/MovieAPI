//Filename: api-routes.js
//Initialize express router
import express from 'express'
const router = new express.Router()

//Set default API response
router.get('/', function(req,res){
    res.json({
        status : 'API is working',
        message : 'Welcome to my Rest API!'
    });
});


export default router;