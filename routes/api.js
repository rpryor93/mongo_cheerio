// api routes
// require dependencies
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');


// load our mongoose models
var Articles = require('../models/Articles.js');
var Comments = require('../models/Comments.js');


// export api routes for the express app
module.exports = function(app) {

    // api call that scrapes the page
    // (returns code 200 ("OK") on err, since no scrape should not kill the site's process)
    app.get('/api/scrape', function(req, res) {
        // first, we scrape the Reuters tech section for articles.
        request('http://www.reuters.com/news/archive/technologyNews', function (error, response, html) {
            var articles = [];
            var $ = cheerio.load(html);
            if ($('.news-headline-list')) {
                $('.story').each(function() {
                    // save the article
                    var article = {
                        title: 		$(this).find('h3').text(),
                        nutgraf: 	$(this).find('p').text(),
                        image: 		$(this).find('.story-photo a img').attr('org-src'),
                        link: 		'http://www.reuters.com' + $(this).find('.story-photo a').attr('href'),
                    }
                    articles.push(article);
                })
            };
            // with all that done, prepare to insert all non-duplicates into db
            Articles.create(articles, onInsert);

            // create the callback that the last method called
            function onInsert(err, docs){
                if (err){
                    // for error, 200 (OK (nothing created, but not a deadend for our app))
                    console.log(err);
                    res.status(200).end();
                } else {
                    // else, 201 (Created)
                    console.log(docs);
                    res.status(201).end();
                }
            }
        });
    })

    // call to grap articles and send them as json
    app.get('/api/retrieve', function(req, res) {

        // reach into the Articles db for at least 50 results
        var query = Articles.find().sort({'created_at': -1}).limit(50);
        query.exec(function(err, docs) {
            if (err){
                console.log(error)
            } else {
                res.json(docs);
            }
        })
    })

    // grab comments for an article
    app.get('/api/comment/:id', function(req, res){
        // find the article that matches the id from the req.param
        Articles.findOne({'_id': req.params.id})
        // populate from the comment objects saved in the article
            .populate('comment')
            // execute the command and send success message if it works
            .exec(function(err, doc){
                if (err){
                    console.log(err);
                } else {
                    res.json(doc);
                }
            });
    });

    // post a comment
    app.post('/api/comment/:id', function(req, res){
        // using the body of the post, create a comment
        var comment = new Comments(req.body);

        //save the comment
        comment.save(function(err, doc){
            if(err){
                console.log(err);
            } else {
                // of everything checks out, find the apropos article
                Articles.findOneAndUpdate(
                    // save the objectID of the comment to the article's comment array
                    {'_id': req.params.id},
                    {$push: {'comment':doc._id}},
                    {safe: true, upsert: true})
                // execute the comman and send success message if it works
                    .exec(function(err, doc){
                        if (err){
                            console.log(err);
                        } else {
                            console.log("ok!")
                            res.status(201).end();
                        }
                    });

            }
        });
    });

    app.delete('/api/r-comment/:id', function(req, res){
        // first, grab the comment id and article id
        var c_id = req.params.id;
        var a_id = req.body.a_id;
        // and make an objectID reference for the comment
        // now, find the comment and delete it
        Comments.find({'_id': c_id}).remove(function(){
            // and with that done, find the article by it's id,
            // and remove the comment from the reference array in that article
            Articles.findOneAndUpdate(
                {'_id': a_id},
                {$pull: {'comment':c_id}})
                .exec(function(err, doc){
                    if (err){
                        console.log(err);
                    } else {
                        console.log("deleted")
                        res.status(204).end();
                    }
                });
        })
    })
}