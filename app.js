require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const connectDB = require('./server/config/database');
const session = require('express-session');
const methodOverride = require('method-override');
// const crypto = require('crypto');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

const app = express();


const port = process.env.PORT || 5000  

//connect to db
connectDB();

app.use(express.static(path.join(__dirname, 'public')));
// app.get('/favicon.ico', (req, res) => res.status(204)); // Respond with no content

//templating engine

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use(methodOverride('_method')); 

app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.use((req,res,next) => {
    res.locals.locals = {
        title: "CRUD App",
        description: "A simple CRUD application using Express and MongoDB",
        author: "Eklavya Nath"
    }
    next();
})

const sessionSecret = jwt.sign({}, process.env.SECRET_SESSION_KEY, { expiresIn: '1d' });

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


// Middleware to set isAuthenticated variable
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user ? true : false; // Check if user is authenticated
    res.locals.user = req.session.user || null; // Optionally, store user info for later use
    next();
});

app.use('/',require('./server/routes/main'));

app.listen(port, () => {
    console.log('App is running on port ' + port);
})