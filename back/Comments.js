// REST API for the comments collection

// Connect to the collection of comments
let db = null;
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
  if (error) throw error;
  db = client.db('fiction');
  db.comments = db.collection('comments');
});

const express = require('express');
const router = express.Router();


//Get all the comments about this specific story
router.get('/:story_id', function(request, response, next) {
  const comment = {story_id: new mongodb.ObjectId(request.params.story_id)};

  db.comments.find(comment).toArray(function(error, comments) {
    if (error) return next(error);
    response.json(comments);
  })
});

// route to accept new posted comments
router.post('/', function(request, response, next) {
  if (!request.user) return next(new Error('Forbidden')); //checks to see that person is loged in, prevents command line hack
    const comment ={
    author: request.body.author,
    story_id: request.body.story,
    text: request.body.text
    };
    console.log(comment)

  db.comments.insertOne(comment, function(error, profile) {
    if (error) return next(error);
    if (!profile) return next(new Error('Not found'));
    response.json(comments);
  });
});



module.exports = router;
