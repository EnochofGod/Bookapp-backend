const express = require('express')
const cors = require('cors')

// Check required environment variables
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
    console.error('Missing required environment variables: JWT_SECRET or MONGO_URI');
    process.exit(1);
}

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const authRouter = require('./routes/auth')
const bookRouter = require('./routes/books')
const multer = require('multer');

app.use(cors({
  origin: true
}))

app.use('/auth', authRouter);
app.use('/books', bookRouter);

app.use((err,req,res,next) => {
    if(err instanceof multer.MulterError) {
        if(err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 5MB limit' });
        }
        return res.status(400).json({ error: err.message });
    }else if(err.message === 'Only image files are allowed') {
        return res.status(400).json({ error: 'Only image files are allowed' });
    }
    next(err);
})

app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});


module.exports= app;