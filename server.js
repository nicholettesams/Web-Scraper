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
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/articles";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })

// ROUTES

// Route for getting all Articles from the db, returned as JSON
app.get("/articles-json", function(req, res) {

  db.Article.find()
    .then(function(dbArticle) {
      res.json(dbArticle)
    })
    .catch(function(err) {
        res.json(err)
    })
});

// Route for getting all unsaved articles and calling index page
app.get("/articles", function(req, res) {

  db.Article.find({saved: false})
       .then(articles => {
         res.render("index", {article: articles})
       })
       .catch(function(err) {
        // If an error occurs, log the error message
        console.log(err.message);
      });
});

// Route for scraping articles and then calling index page to display all unsaved articles
app.get("/scrape", function(req, res){

  axios.get("https://www.npr.org/sections/technology/")
  .then(function(response) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(response.data);
  
    // With cheerio, find each tag with the "title" class
    $(".item-info").each(function(i, element) {

      var data = {
        title: $(element).children('h2').text(),
        link: $(element).children('h2').children('a').attr("href"),
        summary: $(element).children('p').text(),
      };

      console.log(data)

      // Save these results in mongodb
      if (data.title && data.link){

        //UpdateOne (update was deprecated) with upsert instead of create so that it will 
        //only be created if the article doesn't already exist
        db.Article.updateOne({title: data.title}, {$set: data}, {upsert: true})
        .then(function(dbArticle) {
          // If saved successfully, print the new Article document to the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurs, log the error message
          console.log(err.message);
        });

      }

    });


  })
  .then(function(){
       // gets all unsaved articles from database and sends them to handlebars page
       db.Article.find({saved: false})
       .then(articles => {
         res.render("index", {article: articles})
       })
       .catch(function(err) {
        // If an error occurs, log the error message
        console.log(err.message);
      });

  })

})

//clear articles
app.get('/clearAll', function(req, res) {
  // using deleteMany because remove was depricated
  db.Article.deleteMany({}, function(err, doc) {
      if (err) {
          console.log(err);
      } else {
          console.log('articles removed');
      }

  });
  res.render("index")
});


// Route for saving the article
app.post("/saved/:id", function(req, res) {
  // res.redirect("/")
  console.log(req.params.id)
  db.Article.updateOne({_id: req.params.id}, {$set: {saved: true}}, function(err, doc) {
    if (err) {
      res.send(err);
    }
    else {
      console.log("article is saved")
      res.redirect("/articles")
    }
  });
});

// Route for removing saved articles
app.post("/remove/:id", function(req, res) {

  console.log(req.params.id)
  db.Article.updateOne({_id: req.params.id}, {$set: {saved: false}}, function(err, doc) {
    if (err) {
      res.send(err);
    }
    else {
      console.log("article is no longer saved")
      res.redirect("/saved")
    }
  });
});

// Gets saved articles and calls saved handlebars page
app.get('/saved', function(req, res) {

  db.Article.find({saved: true})
       .then(articles => {
         res.render("saved", {article: articles})
       })
       .catch(function(err) {
        // If an error occurs, log the error message
        console.log(err.message);
      });
});


// Routes for Comments

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function(req, res) {

  db.Article.findOne({ _id: req.params.id})
  .populate("comment") //the key in the article schema
  .then(function(dbArticle) {
    res.json(dbArticle)
  })
  .catch(function(err) {
      res.json(err)
  })
});

// Route for saving/updating an Article's associated Comment
app.post("/articlenotes/:id", function(req, res) {
  console.log(req.body)
  db.Comment.create(req.body)
  
  .then(function(dbComment) {
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true })
  })
  .then(function(dbArticle){
    //res.json(dbArticle)
    res.redirect("/saved")
  })
  .catch(function(err) { 
    // If an error occurred, log it
    console.log(err);
  });
});



// HTML Route for home page
app.get('/', function(req, res) {
  res.redirect("/articles")
});

// Setup port
var PORT = process.env.PORT || 3000
app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});

