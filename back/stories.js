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
  const story_id = {_id: new mongodb.ObjectId(request.params.id)};
// then it is an update of an existing chapter

  db.stories.updateOne(story_id,    //update the text and title
    {$set: {
        ['chapters.'+ (request.body.index)+'.text']: request.body.text,
        ['chapters.'+ (request.body.index)+'.title']: request.body.chapter_title,
        title: request.body.story_title,
        summary: request.body.summary
    }});
  /*
  //otherwise the author wants to create a new chapter
  const chapter = {
    title: `create a title...`,
    text: `write a story...`
  }
  db.stories.updateOne(story_id,
  {chapters: {$push: chapter }});
  console.log("added chapter to database");
*/

});



module.exports = router;
