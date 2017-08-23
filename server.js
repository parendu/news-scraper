  // Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");


// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();
var PORT = process.env.PORT || 8000;

// Require the routes in controllers js file
require("./controllers/articleController.js")(app);

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// allow the handlesbars engine to be in our toolset
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
// Now set handlebars engine
app.set('view engine', 'handlebars');

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scrape1");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});



// Listen on port 8000
app.listen(PORT, function() {
  console.log("App running on port" + PORT);
});
