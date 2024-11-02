// const User = require("../server/models/user");
const sendmail = require('../server/models/email');
const User = require('../server/models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {promisify} = require('util');

const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN});
}

exports.signup = async (req,res,next) => {
    try {
        
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirmation: req.body.passwordConfirmation,
            passwordChangedAt: req.body.passwordChangedAt,
            role:req.body.role
        })

        console.log(newUser);

        const token = signToken(newUser._id);

        res.redirect('/login');

    } catch (error) {
        const locals = {
            title: "Sign Up",
            message: error.message // Pass the error message to the view
        };
        res.render('signup', { locals });
    }
}

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        if(!email ||!password) {
            // return res.status(400).json({
            //     status: 'fail',
            //     message: 'Please provide email and password'
            // })
            const locals = {
                title: "Login",
                message: 'Please provide email and password'
            }
            res.render('login', {locals})
        }
            //check if user and password is correct
            const user = await User.findOne({email}).select('+password');

            if(!user || !(await user.checkPassword(password,user.password)) ){
                // return res.status(401).json({
                //     status: 'fail',
                //     message: 'Invalid email or password'
                // })
                const locals = {
                    title: "Login",
                    message: 'Invalid email or password'
                }
                res.render('login', {locals})
            }
            
            //generate token
            const token = signToken(user._id);

            //setting the session
            req.session.user = {id: user._id , role: user.role};

            res.redirect('/blog');
        }

     catch (error) {
        // res.status(500).json({
        //     status: 'error',
        //     message: 'An error occurred during login'
        // });
        const locals = {
            title: "Login",
            message: 'An error occurred during login'
        }
        res.render('login', {locals})
    }
}

exports.logout = (req, res, next) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            // return res.status(500).json({
            //     status: 'error',
            //     message: 'Could not log out. Please try again.',
            // });
            const locals = {
                title: "Logout",
                message: 'Could not log out. Please try again.'
            }
            res.render('login', {locals})
        }
        res.redirect('/'); // Redirect to home page or login page
    });
};

// exports.restrictTo = (...roles) => {
//     return (req,res,next) => {
        
//         // roles = ['user','guide'] , ['lead-guide','admin']

//         if(!roles.includes(req.user.role)){
//             return next(new AppError('You do not have permission to access this',403));
//         }
//         next();
//     }
// }

exports.protect = async(req,res,next) => {
    if(!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

exports.forgotPassword = async(req,res,next) => {

        const user = await User.findOne({email:req.body.email});

        if(!user){
            const locals = {
                    title: "Forgot Password",
                    message: "User not found. Please check your email and try again."
            }

            return res.render('forgotpassword', { locals });
        }

        //generate token for the user
        const resetToken = user.createResetToken();

        await user.save({validateBeforeSave: false});

        const resetURL = `/resetPassword/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested to reset your password. Please find the token in last of this link: \n\n${resetURL}\n\nIf you did not request this, please ignore this email and no changes will be made.`;

        try {
            await sendmail({
                email: user.email,
                subject: 'Password Reset Token only valid for 10 mins',
                message
            })

            const locals = {
                title: "Forgot Password",
                message: 'Token sent to your email. Please check your inbox.'
            };

            return res.render('resetPassword', { locals });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpiresAt = undefined;

            await user.save({validateBeforeSave:false});
            console.log(error);
            
        const locals = {
            title: "Forgot Password",
            message: 'Failed to send email. Please try again later.'
        };
        return res.render('forgotpassword', { locals });
        }
}

exports.resetPassword = async(req,res,next) => {
    try {
        
        const hasToken = crypto
                                .createHash('sha256')
                                .update(req.body.token)
                                .digest('hex');
    
        const user = await User.findOne({
            passwordResetToken: hasToken,
            passwordResetExpiresAt: {$gt: Date.now()}
        })
    
        if(!user){
            const locals = {
                title: "Reset Password",
                message: 'Invalid token or token expired. Please request a new password reset.'
            };
            return res.render('resetpassword', { locals });
        }
    
        user.password = req.body.password;
        user.passwordConfirmation = req.body.passwordConfirmation;
        user.passwordResetToken = undefined;
        user.passwordResetExpiresAt = undefined;
        await user.save();
    
        const token = signToken(user._id);
    
        await sendmail({
            email: user.email,
            subject: 'Your password has been changed',
            message: 'Your password has been successfully reset.'
        });
    
        const locals = {
            message:'Your password has been changed successfully!! Now please login'
        }

        res.render('login', { locals });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }

}


// exports.isExist = async (req, res, next) => {
//     try {
//         // 1. Getting the token and check if it still exists
//         let token;

//         if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//             token = req.headers.authorization.split(' ')[1];
//         }

//         // 2. Check if token exists
//         if (!token) {
//             return res.status(401).json({
//                 status: 'fail',
//                 message: 'You are not logged in to get the access.',
//             });
//         }

//         // 3. Verify the token
//         const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//         // 4. Check if user still exists or if the user is deleted
//         const freshUser = await User.findById(decoded.id);
//         if (!freshUser) {
//             return res.status(401).json({
//                 status: 'fail',
//                 message: 'The user doesn\'t exist any longer',
//             });
//         }

//         // 5. Check if user changed password after that token
//         if (freshUser.changedPassword(decoded.iat)) {
//             return res.status(401).json({
//                 status: 'fail',
//                 message: 'The user changed password! Please login again',
//             });
//         }

//         // Grant access to protected route
//         req.user = freshUser;

//         next();
//     } catch (error) {
//         return res.status(500).json({
//             status: 'error',
//             message: 'An error occurred while verifying the user.',
//         });
//     }
// };

exports.updatepassword = async(req,res,next) => {
    try {
        const user = await User.findById(req.session.user.id).select('+password');
        console.log(req.session.user.id);

        if(!user || !(await user.checkPassword(req.body.Currentpassword,user.password))) {
            
         console.log(req.body.Currentpassword,user.password);   
            const locals = {
                message:'Current password is incorrect'
            }

            console.log(locals.message);
            return res.render('login', {locals: locals});
        }

         // Check if new password and confirmation match
         if (req.body.password !== req.body.passwordConfirmation) {
            const locals = {
                message: 'New password and confirmation do not match'
            };
            return res.render('updatepassword',{locals: locals});
        }

        user.password = req.body.password;
        user.passwordConfirmation = req.body.passwordConfirmation;

        await user.save();
        
        const token = signToken(user._id);
      
        const locals = {
            message: 'Password changed successfully. Please log in again with your new password.'
        };
        // Redirect to login page with success message

        res.render('login', { locals });
    } catch (error) {

        console.log(error);

        const locals = {
            message: 'some error ocurred internally'
        };
        return res.render('login', { locals:locals });
        }   
}