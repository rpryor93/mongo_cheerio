/* front end js for Scraper18
 * -/-/-/-/-/-/-/-/-/-/-/- */

// 1: Global defines
// =================

// articles array
var articles = [];

// current article counter
var cur_article = 1;

// article class constructor
function Article(title, nutgraf, image, link, id, arr){
    // save the arguments as the object's properties
    this.title = title;
    this.nutgraf = nutgraf;
    this.image = image;
    this.link = link;
    this.id = id

    // on construction, push object to array specified in last arg
    // (e.g., the "articles" array)
    arr.push(this);
}



// 2: Functions
// ============

// to run on load
var load = function(){
    // first, we scrape
    $.get('api/scrape', function(){
        // if the scrape is successful, make the next api call
        // to grab articles from the db
        $.get("api/retrieve", function(data){
            // on success, we grab the data and place it in the articles array
            // using the article class constructor above
            $.each(data, function(i){
                new Article(data[i].title,
                    data[i].nutgraf,
                    data[i].image,
                    data[i].link,
                    data[i]._id,
                    articles
                );
            })
            dispArticle();
        })
    })
}

// display the current article and apropos comments
var dispArticle = function(){
    // Part 1: display the article
    // first, get the current article (-1 to accomodate for array index)
    var article = articles[cur_article - 1];
    // display that article on the page
    // first create div
    var theDiv = $('<div>').addClass('article')
        .attr('data-id', article.id);
    // then the contents of the div
    var storyNum = $('<p>').addClass('storyNum')
        .text("Story #" + (cur_article));
    var storyTitle = $('<h2>').addClass('storyTitle')
        .html("<a href='" + article.link + "' target='_blank'>" + article.title + "</a>");
    var storyNutgraf = $('<p>').addClass('storyNutgraf')
        .text(article.nutgraf);
    // father the div
    theDiv.append(storyNum, storyTitle, storyNutgraf);
    // and place that div in the proper spot on our page
    $('#storyDisplay').html(theDiv);

    // and make the button section show the right nums
    $('#articleCounter').text("Article " + (cur_article) +
        " of " + articles.length);

    // Part2: Display the comments
    // first, make the url for the comments (both get and post)
    var url = "api/comment/" + article.id;
    // then, grab the comments related to the article with a get request
    $.get(url, function(result){
        // make the div we'll put our comments in
        var theDiv = $("<div>").addClass("comments")
        // save the comments from the result into an array
        var comments = result.comment;
        // go through array, and add comments to the div
        $.each(comments, function(i){
            // sub div
            var c_div = $('<div>').addClass('comment');
            // title, body and date text
            var c_title = $('<h4>').addClass('commentTitle')
                .html(comments[i].title +
                    " <span class='glyphicon glyphicon-remove delete' data-id='"+ comments[i]._id +"'></span>");
            var c_body = $('<p>').addClass('commentBody')
                .text(comments[i].body);
            var c_date = $('<p>').addClass('commentDate')
                .text("- " + moment(comments[i].time).format("MMMM DD, YYYY - hh:mma "));

            // append the subdiv
            c_div.append(c_title, c_body, c_date);

            // append the father div
            theDiv.append(c_div);
        })
        // add the father div to the comment's section of the page
        $('#commentDisplay').html(theDiv);
    })


    // Part3: Display the Comment Form
    // first, save the form along with the url that we'll be posting to
    var comForm = '<form id="leaveComment" action="' + url + '" method="POST" role="form">' +
        '<legend>Leave a Comment</legend>' +
        '<div class="form-group">' +
        '<input type="text" class="form-control" id="title" name="title" placeholder="Title">' +
        '<textarea type="text" class="form-control" id="body" name="body" rows="5" placeholder="Comment Text"></textarea>' +
        '</div>' +
        '<button type="submit" id="submit" class="btn btn-success">Submit</button>' +
        '</form>';

    // then, place the form on the page
    $('#commentForm').html(comForm);
}

// switch article (if isPrev is true, goes back an article. Otherwise, goes forward)
var articleSwitch = function(isPrev) {
    // get articles length
    var maxArticles = articles.length;
    // if it's not is prev, do make it go to the next article
    if (!isPrev) {
        cur_article++;
        // if that made cur_article's number exceed the max, make cur_article 1
        if (cur_article > maxArticles) {
            cur_article = 1;
        }
    } // but if isPrev is true
    else{
        // send the cur_article back one
        cur_article--;
        // but if that made cur_article equal 0, make cur_article = maxArticles
        if (cur_article == 0){
            cur_article = maxArticles;
        }
    }
    // with all that done, display the article
    dispArticle();
}

// add delete functionality to spanned X buttons
var deleteComment = function(span){

    // grab the comment id
    var commentId = span.attr('data-id');

    // make the url
    var url = "api/r-comment/" + commentId;

    // grab the article id
    var data = {
        a_id: $('.article').attr('data-id')
    }
    // make the ajax call
    $.ajax({
        url: url,
        type: 'DELETE',
        data: data,
        success: function() {
            dispArticle();
        }
    });
}

// 3. FORM FUNCTIONS
// =================

// a) Comment form
var commentForm = function(){
    // grab the form information, save it to data var
    var data = {
        title: $('#title').val().trim(),
        body: $('#body').val().trim()
    }

    // if data.title or data.body is empty, stop the function
    if (data.title == "" || data.body == "") {
        return false
    }

    // make the url from the form's action attr
    var url = $('#leaveComment').attr('action');
    // make the api call
    $.post(url, data, function(){
        console.log('ok');
        // on success, reload the article, along with new comment
        dispArticle();
    })
}


// calls
// =====

// on load
$(document).on("ready", function(){
    load();
})

// on pressing next and prev buttons
$(document).on('click', '#prev', function(){
    // isPrev = true
    articleSwitch(true);
})

$(document).on('click', '#next', function(){
    // isPrev = false
    articleSwitch(false);
})

// on pressing comment submit button
$(document).on('click', '#submit', function(){
    commentForm();
    // prevent refresh
    return false;
})

// on pressing a delete button
$(document).on('click', '.delete', function(){
    deleteComment($(this));
    // prevent refresh
    return false;
})