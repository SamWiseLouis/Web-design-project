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
  // access control: user must be the author of the comment (if not anonymous)
  if (request.user && request.user.id !== request.body.author.id) return next(new Error('Forbidden'));

  const comment = {
    author: request.body.author,
    story_id: new mongodb.ObjectId(request.body.story),
    text: request.body.text
  };

  db.comments.insertOne(comment, function(error) {
    if (error) return next(error);
    response.json(comment);
  });
});

// route to delete a comment
router.delete('/', function(request, response, next) {
  // access control: user must be logged in
  if (!request.user) return next(new Error('Forbidden'));
  // access control: user must be the author of the comment
  if (request.user.id !== request.body.user) return next(new Error('Forbidden'));

  const comment = {
    'author.id': request.body.user,
    story_id: new mongodb.ObjectId(request.body.story)
  };

  db.comments.deleteOne(comment, function(error) {
    if (error) return next(error);
    response.json(comment);
  });
});

module.exports = router;
