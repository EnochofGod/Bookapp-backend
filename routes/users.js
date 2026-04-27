const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res, next) => {
    try{
        let query = {};
        if(req.query.author){
            query.author = { $regex: req.query.author, $options: 'i' };
        }
        const users = await User.find(query);
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
})
router.get('/:id', async(req,res) =>{
    try{
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ error: "user not found"});
    res.status(200).json(user);
    }catch(err){
        if(err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid user ID" });
        }
    }
})
router.post('/', async (req, res) => {
    try{
        const user = await User.create(req.body);
        res.status(201).json(user);
    }catch(err){
        if(err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
    }
})
router.put('/:id', async (req, res) => {
    try {
        const {title, author} = req.body;
         if(!title || !author) {
            return res.status(400).json({ error: "Title and author are required" });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { title, author }, 
            { new: true }, { runValidators: true });
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        next(err);
    }
});
router.patch('/:id', async (req,res) => {
    try{
        const user = await User.findByIdAndUpdate(req.params.id,
            req.body, 
            { new: true, runValidators: true });
        if(!user) return res.status(404).json({ error: "user not found" });
        res.status(200).json(user);
    }
    catch(err){
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid user ID" });
        }        next(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "user not found" });
        }
        res.status(204).send();
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        next(err);
    }
});


module.exports = router;