//Scrapping tool

var request = require("request");
var cheerio = require("cheerio");

//Articles/link and notes

var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");

module.exports = function (app) {

//redirect to article page
app.get('/', function (req, res){
	res.redirect('/articles');
});

//scrape data

app.get("/scrape", function(req, res){
 // request("https://nytimes.com", function(error, response, html){

   request("https://petapixel.com/", function(error, response, html){ 
  	//save data
  	var $ = cheerio.load(html); 
    
     $(".post-excerpt").each(function (i, element) {

        var title = $(this)
          .children("h2")
          .children("a")
          .text();
        var link = $(this)
          .children("h2")
          .children("a")
          .attr("href");
        var articleSnippet = $(this)
          .children("div.text")
          .text();

          //nyt news

    // $(".title").each(function(i, element){
    // 	var title = $(element).children("a").text();
    // 	var link = $(element).children("a").attr("href");

    if (title && link && articleSnippet){
    	
    	var result = {};

    		result.title= title;
    		result.link= link;
    	 result.articleSnippet = articleSnippet;
       
    	Article.create(result, function(err, doc) {
    		if (err) {
    			console.log(err);
    		} else {
    			console.log(doc);
    		}
    	
    	});
    }

    }); 

  }); // request
   //Send  a "Scrape complete" message to the browser
  // res.send("Scrape Complete");
   res.redirect("/");
});  // get scrape

  // Retrieve data from the db
  app.get("/articles", function (req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function (error, doc) {
        // Log any errors
        if (error) {
          console.log(error// Or send the doc to the browser as a json object
          );
        } else {
          res.render("index", {result: doc});
        }
        //Will sort the articles by most recent (-1 = descending order)
      })
      .sort({'_id': -1});
  });

//populate comments associated with articles

app.get("/articles/:id", function(req, res){
//find article and comments
Article.findOne({"_id": req.params.id})
         .populate("comment")
         //execute query
         .exec(function(error, doc){
         	if (error) {
         		console.log(error);
         	} else {
         		res.render("comments", {result:doc});
         	}
         });

});


//create new comments

app.post("/articles/:id", function(req, res){
//create new comment

Comment.create(req.body, function(error, doc){
	if(error){
		console.log(error);
	} else {
		Article.findOneUpdate({
			"_id": req.params.id
		}, {
			$push: {
				"comment": doc._id
			}
		}, {

			safe: true,
			upsert: true,
			new: true
		})

		.exec(function(err, doc){
			if (err) {
				console.log(errr)
			} else {
				res.redirect('back');
			}
		});  //function
	}   //else
});  //create


});  //post


//delete the note

app.delete("/articles/:id/:comment_id", function(req, res){
	Comment.findByAndRemove(req.params.comment_id, function(error, doc){
		if (error) {
			console.log(error);
		} else {
			Article.findOneUpdate({"_id": req.params.id
		}, {
      $pull: {
			"comment" : doc._id
		}

		})
.exec(function(err, doc){
	if (err) {
		console.log(err)
	} 
});

		}
	});
});

};

