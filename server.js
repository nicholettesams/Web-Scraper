// Dependencies
var express = require("express");
var cheerio = require("cheerio");
var axios = require("axios");
var exphbs = require('express-handlebars');
var mongoose = require('mongoose'); 

// Bring in schema
var Aritcle = require("./articleModel.js");

// Initialize Express
var app = express();
app.use(express.static(process.cwd() + "/public"));

// Initialize Handlebars
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

mongoose.connect("mongodb://localhost:27017/articles", { useNewUrlParser: true })


  // Main route (simple Hello World Message)
  app.get("/", function(req, res) {
    res.send("Hello world");
  });

  app.get("/all", function(req, res) {
    // Query: In our database, go to the animals collection, then "find" everything
    Aritcle.find({}).toArray()
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
        if (title & link){

          Article.create(data)
          .then(function(dbExample) {
            // If saved successfully, print the new Example document to the console
            console.log(dbExample);
          })
          .catch(function(err) {
            // If an error occurs, log the error message
            console.log(err.message);
          });

        }

      });

    })

  })

  // Setup port
  var PORT = process.env.PORT || 3000
  app.listen(PORT, function() {
    console.log("App running on port " + PORT);
  });

