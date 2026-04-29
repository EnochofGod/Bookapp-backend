const mongoose = require('mongoose')
const connectDB = async () => {
    try{
        console.log('Attempting to connect to MongoDB...')
        console.log('MONGO_URI exists:', !!process.env.MONGO_URI)
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected successfully')
    }catch(err){
        console.error('DB error: ' + err.message)
        console.error('DB error details:', err)
        process.exit(1)
    }
}

module.exports = connectDB