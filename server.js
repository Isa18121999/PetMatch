// Read and set environment variables
require("dotenv").config();

var express = require("express");

//Requiring models
var db = require("./models");

//Define port to listen on.
var PORT = process.env.PORT || 3000;

//App is using express.
var app = express();


// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
require("./controllers/petMatchController.js")(app);
require("./controllers/savedPetsController.js")(app);
require("./controllers/petfinderController.js")(app);

app.get("/health", function(req, res) {
  res.status(200).json({ status: "ok" });
});

app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: "An unexpected server error occurred." });
});

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("App listening on port " + PORT);
  });
}).catch(function(error) {
  console.error("Unable to connect to the database:", error.message);
  process.exit(1);
});
