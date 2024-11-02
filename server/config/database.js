const mongoose = require('mongoose');
const connectDB = async () => {
require('dotenv').config();

    try {
        mongoose.set('strictQuery',false);// how strictly Mongoose applies conditions in queries. Setting it to false makes Mongoose more flexible, ignoring conditions that don’t exist in your schema.
        const conn = await mongoose.connect(process.env.MONGODB_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`Database conenected successfully ${conn.connection.host}`);
        // console.log(process.env.MONGODB_URL);
    } catch (error) {
        console.log(error);
        process.exit(1); 
    }
}

module.exports = connectDB;