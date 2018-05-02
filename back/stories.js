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
  db.profiles = db.collection('profiles');
});

// get all the stories
router.get('/', function(request, response, next) {
  const user_id = request.query.user;

  db.stories.find().toArray(function(error, stories) {
    if (error) return next(error);
    response.json(stories);
  });
});

// get story by id
router.get('/:id', function(request, response, next) {
  const story_id = {_id: new mongodb.ObjectId(request.params.id)};

  db.stories.findOne(story_id, function(error, story) {
    if (error) return next(error);
    if (!story) return next(new Error('Not found'));
    response.json(story);
  });
});

router.patch('/:id', function(request, response, next){
  // access control: user must be the author of the story
  const story_id = {_id: new mongodb.ObjectId(request.params.id)};
  db.stories.findOne(story_id, function(error, story) {
    if (error) return next(error);
    if (!story) return next(new Error('Not found'));
    if (request.user && (story.author.id !== request.user.id)) {
      return next(Error('Forbidden'));
    } else if (!request.user){
      return next(Error('Forbidden'));
    }
    // here we're safe to update it
    if (request.body.index > -1){
      db.stories.updateOne(story_id,  // update includes a chapter update
        {$set: {
          ['chapters.' + request.body.index + '.text']: request.body.text,
          ['chapters.' + request.body.index + '.title']: request.body.chapter_title,
          title: request.body.story_title,
          summary: request.body.summary,
          tags: request.body.tags
      }}, function(error, report) {
        if (error) return next(error);
        if (!report.matchedCount) return next(new Error('Not found'));

        response.end();
      });
    } else {
      db.stories.updateOne(story_id,  // update is only for the title or summary
        {$set: {
          title: request.body.story_title,
          summary: request.body.summary,
          tags: request.body.tags
      }}, function(error, report) {
        if (error) return next(error);
        if (!report.matchedCount) return next(new Error('Not found'));
        response.end();
      });
    }
  });
});

router.post('/', function(request, response, next) {
  if (!request.user) return next(new Error('Forbidden'));  // access control: user must be logged in
  // access control: user must be the author of the new story
  if (request.user.id != request.body.user.id || request.user.name != request.body.user.name) return next(new Error('Forbidden'));
  // access control: user must already have a profile to post a story

  db.profiles.findOne({'author.id': request.body.user.id}, function(error, profile) {
    if (error) return next(error);
    if (!profile) return next(new Error('Forbidden'));
    // here we know we can post the story
    const story = {
      title: request.body.story_title,
      summary: request.body.summary,
      author: {id: request.body.user.id, name: request.body.user.name},
      chapters: [{title: request.body.chapter_title, text: request.body.text}],
      tags: request.body.tags
    };

    db.stories.insertOne(story, function(error) {
      if (error) return next(error);
      response.json(story);
    });
  });
});

module.exports = router;
