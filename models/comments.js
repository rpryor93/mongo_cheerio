var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentsSchema = new Schema({
    title: {
        type:String,
        required: true
    },
    body: {
        type:String,
        required: true
    },
    time: {
        type : Date,
        default: Date.now
    }
});

var Comments = mongoose.model('Comments', CommentsSchema);
module.exports = Comments;