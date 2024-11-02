const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './dotenv' }); 
const connectedDB = require('./../server/config/database');

connectedDB();

const Post = require('./../server/models/post');

//reading the files 
const posts = JSON.parse(fs.readFileSync(`${__dirname}/blogs.json`,'utf-8'));

//function to import posts
const importData = async() => {
    try {
        await Post.create(posts);
        console.log('database created successfully');
    } catch (error) {
        console.log(error);
    }

    process.exit();
}

//function to delete all posts
const deleteData = async() => {
    try {
        await Post.deleteMany();
        console.log('Deleted successfully');
    } catch (error) {
        console.log(error);
    }

    process.exit();
}

if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}


