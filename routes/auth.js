const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res, next) => {
    try{
        console.log('Register attempt:', req.body);
        const { name, email, password } = req.body;
        if(!name || !email || !password){
            console.log('Missing fields');
            return res.status(400).json({ error: 'Name, email and password required' });
        }
        if(password.length < 6){
            console.log('Password too short');
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        console.log('Checking existing user');
        const exists = await User.findOne({ email });
        if(exists) {
            console.log('User exists');
            return res.status(400).json({ error: 'Email already in use' });
        }

        console.log('Hashing password');
        const hashed = await bcrypt.hash(password, 10);
        console.log('Creating user');
        const user = await User.create({ name, email, password: hashed });

        console.log('Signing token');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' });

        console.log('Register success');
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email}
        });
    } catch (err) {
        console.error('Register error:', err);
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