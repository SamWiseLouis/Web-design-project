// REST API for the comments collection
const express = require('express');
const router = express.Router();

// Connect to the collection of comments
let db = null;
const mongodb = require('mongodb');
mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
  if (error) throw error;
  db = client.db('fiction');
  db.comments = db.collection('comments');
});



module.exports = router;
