const jwt = require('jsonwebtoken');
const User = require('../modules/user');


/**
 * Using express middleware to intercept requests before routing them.
 * Without middleware : new request -> run route handler
 * With middleware: new request -> do something -> run route handler
 * This needs be before all other app.use() calls
 */
const auth = async (req , res, next) => {
    try {
        const authToken = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(authToken,process.env.JWT_SECRET);
        const user = await User.findOne({_id: decoded._id, 'tokens.token':authToken});

        if(!user){
            throw new Error();
        }
        req.user = user;
        req.token = authToken;
        next();
    } catch (error) {
        res.status(401).send({error: 'Authentication failed'})
    }
}

module.exports = auth;