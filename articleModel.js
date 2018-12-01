// Require mongoose
var mongoose = require("mongoose");

// Get a reference to the mongoose Schema constructor
var Schema = mongoose.Schema;

var AritcleSchema = new Schema({
 title: {
    type: String,
    trim: true,
    required: "Title is Required"
  },
 link: {
    type: String,
    trim: true,
    required: "Link is Required"
  },
  // `date` must be of type Date. The default value is the current date
  createdDate: {
    type: Date,
    default: Date.now
  }
});

// This creates our model from the above schema, using mongoose's model method
var Aritcle = mongoose.model("Aritcle", AritcleSchema);

// Export the Example model
module.exports = Aritcle;
