// Dependencies
var express = require("express");
var cheerio = require("cheerio");
var axios = require("axios");
var exphbs = require('express-handlebars');
var mongoose = require('mongoose'); 
var logger = require("morgan");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Initialize Handlebars
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//TODO: will need to host this on heroku eventually
mongoose.connect("mongodb://localhost:27017/articles", { useNewUrlParser: true })


// ROUTES

app.get("/articles", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything
  db.Aritcle.find({}).toArray()
  .then(docs => {
    console.log("Documents:" , docs)
    res.json(docs)
  })
  .catch(err => {
    console.error(err)
    res.send("Something went wrong!")
  })

});

app.get("/scrape", function(req, res){

  axios.get("https://news.ycombinator.com/")
  .then(function(response) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);
    
    // With cheerio, find each tag with the "title" class
    $(".title").each(function(i, element) {

      var data = {
        title: $(element).children('a').text(),
        link: $(element).children('a').attr("href")
      };

      // Save these results in mongodb
      if (data.title & data.link){

        db.Article.create(data)
        .then(function(dbArticle) {
          // If saved successfully, print the new Example document to the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurs, log the error message
          console.log(err.message);
        });

      }

    });

    // Send a message to the client
    res.send("Scrape Complete");

  })

})


// Route for grabbing a specific Article by id, populate it with it's comment
// app.get("/articles/:id", function(req, res) {

//   db.Article.findOne({ _id: req.params.id})
//   .populate("comment") //the key in the article schema
//   .then(function(dbArticle) {
//     res.json(dbArticle)
//   })
//   .catch(function(err) {
//       res.json(err)
//   })
// });

// Route for saving/updating an Article's associated Comment
// app.post("/articles/:id", function(req, res) {
//   db.Comment.create(req.body)
//   .then(function(dbComment) {
//     return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true })
//   })
//   .then(function(dbArticle){
//     res.json(dbArticle)
//   })
//   .catch(function(err) { 
//     // If an error occurred, log it
//     console.log(err);
//   });
// });

// Setup port
var PORT = process.env.PORT || 3000
app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});

