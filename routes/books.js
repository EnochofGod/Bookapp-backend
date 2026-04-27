const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

router.get('/', async (req, res, next) => {
    try{
        let query = {};
        if(req.query.author){
            query.author = { $regex: req.query.author, $options: 'i' };
        }
        const books = await Book.find(query);
        res.status(200).json(books);
    } catch (err) {
        next(err);
    }
})
router.get('/:id', async(req,res) =>{
    try{
    const book = await Book.findById(req.params.id);
    if(!book) return res.status(404).json({ error: "Book not found"});
    res.status(200).json(book);
    }catch(err){
        if(err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid book ID" });
        }
        next(err);
    }
})
router.post('/', async (req, res) => {
    try{
        const book = await Book.create(req.body);
        res.status(201).json(book);
    }catch(err){
        if(err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
})
router.put('/:id', async (req, res, next) => {
    try {
        const {title, author} = req.body;
         if(!title || !author) {
            return res.status(400).json({ error: "Title and author are required" });
        }
        const book = await Book.findByIdAndUpdate(
            req.params.id, 
            { title, author }, 
            { new: true }, { runValidators: true });
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.status(200).json(book);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid book ID" });
        }
        next(err);
    }
});
router.patch('/:id', async (req,res, next) => {
    try{
        const book = await Book.findByIdAndUpdate(req.params.id,
            req.body, 
            { new: true, runValidators: true });
        if(!book) return res.status(404).json({ error: "Book not found" });
        res.status(200).json(book);
    }
    catch(err){
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid book ID" });
        }        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.status(204).send();
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid book ID" });
        }
        next(err);
    }
});


module.exports = router;