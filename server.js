const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const request = require("request");
const mongojs = require("mongojs");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 8080;

// Initialize Express
const app = express();

const router = require("./controllers/routes.js");
app.use(router);


// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:8080/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Set Handlebars.
const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
