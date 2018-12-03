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

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {

  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle)
    })
    .catch(function(err) {
        res.json(err)
    })
});

app.get("/scrape", function(req, res){

  axios.get("https://www.npr.org/sections/technology/")
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

      console.log(data)

      // Save these results in mongodb
      if (data.title && data.link){

        //TODO: figure out how to only "create" if the title is not already there
        // dbArticle.findOne({ title: data.title })
        // .then(function (title) {
        //     if (title==null) {
        //        //allow create to happen
        //     }
        //     else {
        //        //do not allow create to happen
        //     }
        // })

        console.log("before the save")
        db.Article.create(data)
        .then(function(dbArticle) {
          // If saved successfully, print the new Article document to the console
          console.log("saved")
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

