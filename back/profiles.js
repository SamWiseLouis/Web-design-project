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

// get profile by user id
router.get('/:id', function(request, response, next) {
  const user_id = request.params.id;

  db.profiles.findOne({'author.id': {$eq: user_id}}, function(error, profile) {
    if (error) return next(error);
    if (!profile) return next(new Error('Not found'));
    response.json(profile);
  });
});

router.patch('/:id', function(request, response, next) {
  if (request.user.id !== db.profiles.find({'_id': request.params.id}).author.id) {  // Access control: user must be the author of the profile
    return next(new Error('Forbidden'));
  }

  const profile = {_id: new mongodb.ObjectId(request.params.id)};

  if (request.body.command === 'username') {
    update = {name: request.body.name};
  } else if (request.body.command === 'desc') {
    update = {desc: request.body.desc};
  } else {
    return next(new Error('Bad request'));
  }

  db.profiles.updateOne(profile, update, function(error, report) {
    if (error) return next(error);
    if (!report.matchedCount) return next(new Error('Not found'));
    response.end();
  });
});

module.exports = router;
