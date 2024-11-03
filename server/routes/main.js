const express = require('express');
const router = express.Router();
const Post = require('./../models/post');
const auth = require('./../../authController/authentication');
const likeControl = require('./../models/features');

router.get('/',(req,res) => {
    const locals = {
        title: "CRUD App",
        description: "A simple CRUD application using Express and MongoDB",
        author: "Eklavya Nath"
    }

    res.render('index',{locals});
})

router.get('/about',(req,res) => {
    res.render('about');
})

router.get('/blog/new',auth.protect,(req,res) => {
    res.render('create');
})

//Adding posts to the index

// Pagination logic here and get all posts from the database
router.get('/blog',async (req,res) => {
    // console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    try {
        const page = parseInt(req.query.page) * 1 || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const posts = await Post.find().skip(skip).limit(limit).sort({likes:-1 ,UpdatedAt:-1}); //fetch all post from the data base

        const count = await Post.countDocuments();

        res.render('blog',{
            posts,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
})

//get post by id
router.get('/post/:id',async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) return res.status(404).send('Post not found');

        res.render('post',{
            post,
            user: req.session.user
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching post');
    }
})

//Create Post
router.post('/blog/create',async (req,res) => {
    // await Post.create(req.body);
    console.log(req.body);
    try {
        
        // res.status(201).json({
        //     message: 'Post created successfully',
        //     post: newPost
        // })
        if (!req.body.title || !req.body.content) {
            return res.status(400).send('Title and Content are required.');
        }

        const newPost = await Post.create({
            ...req.body,
            createdBy: req.session.user._id,
        });

        res.redirect('/blog');

    } catch (error) {
        console.log(error);
        res.status(500).send('Error creating post');
    }   

})

//Update Post
router.get('/blog/update/:id',async (req,res) => {
    try {

        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).send('Post not found');

        //checking if the logged in user is the creator of the post
        if(post.createdBy.toString() !== req.session.user._id.toString()){
            return res.status(403).send('You cannot edit someone else blog try to edit or create your own blog!!');
        }

        res.render('edit',{post});
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching post for editing');
    }
})

//handling the update request
router.post('/blog/update/:id',async(req,res) => {
    try {

        const post = await Post.findById(req.params.id);
        
        if(!post) return res.status(404).send('Post not found');
        
          // Check if the logged-in user is the creator of the post
          if (post.createdBy.toString() !== req.session.user._id.toString()) {
            return res.status(403).send('You cannot edit someone else’s blog.');
        }

        await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.redirect('/blog');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error updating post');
    }
})

//Delete Post
router.post('/blog/delete/:id',async (req,res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        if(!post) return res.status(404).send('Post not found');

        res.redirect('/blog');

    } catch (error) {
        console.log(error);
        res.status(500).send('Error deleting post');
    }
})

//Server sign-up
router.get('/signup',(req,res) =>{
    const locals = {
        title: "Sign Up",
        message: null 
    };
    res.render('signup', { locals });
})

//Server login
router.get('/login',(req,res) => {
    res.render('login');
})

//signUp route
router.post('/signup/new',auth.signup);

//login route
router.post('/login',auth.login);

//logout
router.get('/logout',auth.logout);

//forgotpassword route
router.get('/login/forgotpassword',(req,res) => {
    res.render('forgotpassword');
})
router.post('/login/forgotpassword',auth.forgotPassword);

//reset Password
router.get('/login/resetPassword',(req,res) => {
    res.render('resetpassword');
});
router.post('/login/resetpassword',auth.resetPassword);

//liking the blog functoinality
router.post('/blog/:id/like',auth.protect,likeControl.like);

//upadte password
router.get('/updatepassword',(req,res) => {
    res.render('updatepassword');
})

router.post('/updatepassword', auth.protect, auth.updatepassword); // Handle POST request
router.patch('/updatepassword', auth.protect, auth.updatepassword); // Handle PATCH request

module.exports = router;