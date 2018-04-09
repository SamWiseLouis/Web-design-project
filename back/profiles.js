// REST API for the opinions collection
const express = require('express');
const router = express.Router();

// Connect to the collection
let db = null;
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
  if (error) throw error;
  db = client.db('fiction');
  db.profiles = db.collection('profiles');
});

// get specific profile
router.get('/:id', function(request, response, next) {
  const user_id = request.params.id;

  db.profiles.find({'author.id': {$eq: user_id}}).toArray(function(error, profile) {
    if (error) return next(error);
    response.json(profile);
  });
});

module.exports = router;
