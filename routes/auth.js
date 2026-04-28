const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res, next) => {
    try{
        const { name, email, password } = req.body;
        if(!name || !email || !password){
            return res.status(400).json({ error: ' Name, email and password required' });
        }
        if(password.length < 6){
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const exists = await User.findOne({ email });
        if(exists) return res.status(400).json({ error: 'Email already in use' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' });

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email}
        });
    } catch (err) {
        if(err.code === 11000){
            return res.status(400).json({ error: 'Email already in use' });
        }
        next(err);
    }
});


router.post('/login', async (req, res, next) => {
    try{
        const {email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const user = await User.findOne({ email });
        if(!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' });

        res.status(201).json({ 
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email}
        });
    } catch (err) {
         next(err);
        }
})

module.exports = router;