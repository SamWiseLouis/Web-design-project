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
  db.comments = db.collection('comments');
});

// get the stories
router.get('/', function(request, response, next) {
  // see if we need to get specifically searched for stories
  if (request.query.type && request.query.search) {
    if (request.query.type === "author") {
      db.stories.find({"author.name": request.query.search}).toArray(function(error, stories) {
        if (error) return next(error);
        response.json(stories);
      });
    } else if (request.query.type === "genre") {
      db.stories.find({tags: request.query.search}).toArray(function(error, stories) {
        if (error) return next(error);
        response.json(stories);
      });
    } else if (request.query.type === "length") {
      db.stories.find({length: {$gte: parseInt(request.query.search)}}).toArray(function(error, stories) {
        if (error) return next(error);
        response.json(stories);
      });
    } else {
      return next(new Error('Bad request'));
    }
  } else {  // get all the stories
    db.stories.find().toArray(function(error, stories) {
      if (error) return next(error);
      response.json(stories);
    });
  }
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
    if (!request.user){
      return next(Error('Forbidden'));
    } else if (story.author.id !== request.user.id) {
      return next(Error('Forbidden'));
    }
    // here we're safe to update it
    db.stories.updateOne(story_id,  // update includes a chapter update
      {$set: {
        ['chapters.' + request.body.index + '.text']: request.body.text,
        ['chapters.' + request.body.index + '.title']: request.body.chapter_title,
        title: request.body.story_title,
        summary: request.body.summary,
        tags: request.body.tags,
        length: request.body.length
    }}, function(error, report) {
      if (error) return next(error);
      if (!report.matchedCount) return next(new Error('Not found'));
      response.end();
    });
  });
});

router.post('/', function(request, response, next) {
  if (!request.user) return next(new Error('Forbidden'));  // access control: user must be logged in
  // access control: user must be the author of the new story
  if (request.user.id != request.body.user.id) return next(new Error('Forbidden'));
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
      tags: request.body.tags,
      length: request.body.length
    };

    db.stories.insertOne(story, function(error) {
      if (error) return next(error);
      response.json(story);
    });
  });
});

router.delete('/:id', function(request, response, next) {
  // access control: user must be the author the story to delete a chapter
  const story_id = {_id: new mongodb.ObjectId(request.params.id)};
  db.stories.findOne(story_id, function(error, story) {
    if (error) return next(error);
    if (!story) return next(new Error('Not found'));
    if (!request.user){
      return next(Error('Forbidden'));
    } else if (story.author.id !== request.user.id) {
      return next(Error('Forbidden'));
    }
    // here we know it's safe to delete
    // for if it's just one chapter
    if (request.body.index) {
      db.stories.updateOne(story_id, {$unset: {[request.body.index]: 1}}, function(error, report) {
        if (error) return next(error);
        if (!report.matchedCount) return next(new Error('Not found'));
        db.stories.updateOne(story_id, {$pull: {chapters: null}}, function(error, report) {
          if (error) return next(error);
          if (!report.matchedCount) return next(new Error('Not found'));
          response.end();
        });
      });
    } else {  // for if we have to delete the whole story
      db.stories.deleteOne(story_id, function(error) {
        if (error) return next(error);
        response.end();
      });
      // also delete all comments related to this story
      db.comments.deleteMany({story_id: story_id}, function(error) {
        if (error) return next(error);
        response.end();
      });
      // also delete it from their profile
      db.profiles.updateOne({'author.id': request.body.user.id}, {$pull: {story_ids: new mongodb.ObjectId(request.params.id)}}, function(error) {
        if (error) return next(error);
        response.end();
      });
    }
  });

});

module.exports = router;
