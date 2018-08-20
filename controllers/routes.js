var express = require("express");
const request = require("request");
const cheerio = require("cheerio");
var router = express.Router();
var db = require("../models");

router.get("/scrape", (req, res) => {
    request("https://www.nytimes.com/", (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(body);
            let count = 0;
            $('article').each(function (i, element) {
                let count = i;
                let result = {};
                result.title = $(element)
                    .children('.story-heading')
                    .children('a')
                    .text().trim();
                result.link = $(element)
                    .children('.story-heading')
                    .children('a')
                    .attr("href");
                result.summary = $(element)
                    .children('.summary')
                    .text().trim()
                    || $(element)
                        .children('ul')
                        .text().trim();
                result.byline = $(element)
                    .children('.byline')
                    .text().trim()
                    || 'No byline available'
                
                if (result.title && result.link && result.summary){
                    db.Article.create(result)
                        .then(function (dbArticle) {
                            count++;
                        })
                        .catch(function (err) {
                            return res.json(err);
                        });
                };
            });
            res.redirect('/')
        }
        else if (error || response.statusCode != 200){
            res.send("Error: Unable to obtain new articles")
        }
    });
});

router.get("/", (req, res) => {
    db.Article.find({})
        .then(function (dbArticle) {
            const retrievedArticles = dbArticle;
            let hbsObject;
            hbsObject = {
                articles: retrievedArticles
            };
            res.render("index", hbsObject);        
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.get("/saved", (req, res) => {
    db.Article.find({isSaved: true})
        .then(function (retrievedArticles) {
            let hbsObject;
            hbsObject = {
                articles: retrievedArticles
            };
            res.render("saved", hbsObject);
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.put("/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: true })
        .then(function (data) {
            res.json(data);
        })
        .catch(function (err) {
            res.json(err);
        });;
});

router.put("/remove/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: false })
        .then(function (data) {
            res.json(data)
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.find({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate({
            path: 'note',
            model: 'Note'
        })
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post("/note/:id", function (req, res) {
    // console.log(req);
    console.log(dbArticle);
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // console.log('note created');
            console.log(req.body);
            console.log(dbNote);
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { note: dbNote._id }}, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

router.delete("/note/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.findByIdAndRemove({ _id: req.params.id })
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ note: req.params.id }, { $pullAll: [{ note: req.params.id }]});
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

module.exports = router;
