const mongoose = require('mongoose');
const validate = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        validator: [validate.isEmail,'Please provide a valid email address']
    },
    role: {
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    password:{
        type: String,  // Changed from Number to String
        required: [true, 'Password is required'],
        // unique:true,
        minlength: [7, 'Password must be at least 8 characters long'],  // lowercase minlength
        maxlength: [15, 'Password must be at most 10 characters long'], // lowercase maxlength
        select:false
    },
    passwordConfirmation: {
        type: String,  // Changed from Number to String
        required: [true, 'Password confirmation is required'],
        validate: {
            // this only works on save and create
            validator: function(value) {
             
                return value === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    active:{
        type:Boolean,
        default:true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpiresAt: Date
})

UserSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);

    this.passwordConfirmation = undefined;  // remove passwordConfirmation field
    next();
})

UserSchema.methods.checkPassword = async function(candidatePassword,userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

UserSchema.methods.createResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    //this will be get stored in the databse
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;
    return resetToken;
        
}

module.exports = mongoose.model('User', UserSchema);