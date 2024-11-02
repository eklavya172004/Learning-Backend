const Post = require('./../models/post');

exports.like = async(req, res,next) => {

    try {
        
        const blogID = req.params.id;
        const blog = await Post.findById(blogID);
        
        if(!blog) return res.status(404).send('Blog post not found');

        //checking if user has already liked the blog
        if(blog.likedBy.includes(req.session.user._id)){
            return res.status(400).json({message: 'You have already liked this blog'});
        }
    
        blog.likes++;
        blog.likedBy.push(req.session.user._id);
        await blog.save();
        
        res.status(200).json({message: 'blog is liked', likes: blog.likes});

    } catch (error) {
        console.log(error);
         res.status(500).json({ message: 'An error occurred while liking the blog' });
    }
}