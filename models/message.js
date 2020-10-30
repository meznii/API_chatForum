
const mongoose = require('mongoose');
var mongooseemailvalidator = require('mongoose-unique-validator');

const messageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        required: true
    },
    datecreation: {
        type: Date,
        required: true,
        default: Date.now
    },
     UserName: {
        type: String
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user'
    },
    comments: [  ] 
  //  postId: {
    //    type: mongoose.Schema.Types.ObjectId, 
       // ref: 'Post'
    //}

});


module.exports = mongoose.model('message', messageSchema);