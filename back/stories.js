// REST API for the opinions collection
const express = require('express');
const router = express.Router();

// Connect to the collection
let db = null;
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
  if (error) throw error;
  db = client.db('fiction');
  db.stories = db.collection('stories');
});

// get all the stories
router.get('/', function(request, response, next) {
  const user_id = request.query.user;

  db.stories.find().toArray(function(error, stories) {
    if (error) return next(error);
    response.json(stories);
  });
});

module.exports = router;
