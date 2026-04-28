const jwt = require('jsonwebtoken');
const User = require('../models/User');

const softAuth = async (req, res, next) => {
    try{
        const header = req.header('Authorization');
        if(!header)return next();
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if(user)
            req.user = user;
        next();
    } catch (err) {
        next();
    }
}

module.exports = softAuth;