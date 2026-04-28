const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try{
        const header = req.headers('Authorization');
        if(!header) return res.status(401).json({error:'No token, auth denied'});

        const token = header.replace('Bearer ', '');
        if(!token) return res.status(401).json({error:'No token, auth denied'});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password');
        if(!user) return res.status(401).json({error:'User not found, auth denied'});
        
        req.user = user
        next()
    }catch(err){
        res.status(401).json({error:'Token Invalid or expired'})
    }
}

module.exports = auth;