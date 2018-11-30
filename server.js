// Dependencies
var express = require("express");
var MongoClient = require("mongodb").MongoClient;
var request = require("request");
var cheerio = require("cheerio");
var axios = require("axios");
var exphbs = require('express-handlebars');

// Initialize Express
var app = express();
app.use(express.static(process.cwd() + "/public"));

// Initialize Handlebars
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Database configuration
var database = "scraper";
var collection = "scrapedData";

MongoClient.connect("mongodb://localhost:27017", function(err, client) {
  if (err) throw err;

  const db = client.db(database)
  const scraped = db.collection(collections)

  // Main route (simple Hello World Message)
  app.get("/", function(req, res) {
    res.send("Hello world");
  });

  app.get("/all", function(req, res) {
    // Query: In our database, go to the animals collection, then "find" everything
    scraped.find({}).toArray()
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

      // An empty array to save the data that we'll scrape
      var results = [];

      // With cheerio, find each tag with the "title" class
      $(".title").each(function(i, element) {

        // Save the text of the element in a "title" variable
        var title = $(element).children('a').text();

        // In the currently selected element, look at its child elements (i.e., its a-tags),
        // then save the values for any "href" attributes that the child elements may have
        var link = $(element).children('a').attr("href");

        // Save these results in mongodb
        if (title & link){
          scraped.insert({
            title,
            link
          }, function(err, result) {
              if (err) throw err;

          })

        }

      });

    })

  })

  // Setup port
  var PORT = process.env.PORT || 3000
  app.listen(PORT, function() {
    console.log("App running on port " + PORT);
  });

});
