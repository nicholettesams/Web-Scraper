// Using the tools and techniques you learned so far,
// you will scrape a website of your choice, then place the data
// in a MongoDB database. Be sure to make the database and collection
// before running this exercise.

// Consult the assignment files from earlier in class
// if you need a refresher on Cheerio.

// Dependencies
var express = require("express");
var MongoClient = require("mongodb").MongoClient;
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var axios = require("axios");

// Initialize Express
var app = express();

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

  // TODO: make two more routes

  // Route 1
  // =======
  // This route will retrieve all of the data
  // from the scrapedData collection as a json (this will be populated
  // by the data you scrape using the next route)
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


  // Route 2
  // =======
  // When you visit this route, the server will
  // scrape data from the site of your choice, and save it to
  // MongoDB.
  // TIP: Think back to how you pushed website data
  // into an empty array in the last class. How do you
  // push it into a MongoDB collection instead?
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

  // Listen on port 3000
  app.listen(3000, function() {
    console.log("App running on port 3000!");
  });

});
