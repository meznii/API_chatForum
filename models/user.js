
const mongoose = require('mongoose');
var mongooseemailvalidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    image: { 
        type: String, 
        required: true }
  //  postId: {
    //    type: mongoose.Schema.Types.ObjectId, 
       // ref: 'Post'
    //}

});


module.exports = mongoose.model('user', userSchema);