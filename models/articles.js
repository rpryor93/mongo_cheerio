// set up our mongoose schema class
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// make our Article schema
var ArticlesSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    nutgraf: {
        type: String,
        required:true
    },
    image: {
        type: String,
    },
    link: {
        type: String,
        required:true
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: 'Comments',
    }]
},{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

var Articles = mongoose.model('Articles', ArticlesSchema);
module.exports = Articles;