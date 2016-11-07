
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var methodOverride = require('method-override')



// start the express app
var app = express();

// use logger in dev mode
app.use(logger('dev'));

// use method ovveride
app.use(methodOverride('X-HTTP-Method-Override'))

// set up bodyparse
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));


// make static folder
var staticContentFolder = __dirname + '/public';
app.use(express.static(staticContentFolder));

// our app routes go here
require('./routes/html.js')(app);
require('./routes/api.js')(app);


// configure our db with mongoose
mongoose.connect('mongodb://heroku_cxkb5sd5:hi0639lfao57ok35djfampfgt2@ds021663.mlab.com:21663/heroku_cxkb5sd5');
var db = mongoose.connection;

// mongoose connection: if err, tell us what's up
db.on('error', function(err){
    console.log('Mongoose Error: ', err);
});
// once the con's open, tell us
db.once('open', function(){
    console.log('Mongoose connection successful!');
})


// define port
var PORT = process.env.PORT || 3000;

// listen
app.listen(PORT, function(){
    console.log('app listening on port 3000')
})
