// Set up the database
const db = new Mongo().getDB('fiction');
db.dropDatabase();

// Validate collections
db.createCollection('stories', {validator: {$and: [
  {'author.id': {$type: 'string', $ne: ''}},
  {'author.name': {$type: 'string', $ne: ''}},
  {title: {$type: 'string', $ne: ''}},
  {summary: {$type: 'string'}}, // can be no summary if person chooses
  {chapters: {$type: 'array'}},
  {length: {$type: 'integer'}},  // for searching based on length
  {tags: {$type: 'array'}}  // list of genre tags
]}});

db.createCollection('profiles', {validator: {$and: [
  {'author.id': {$type: 'string', $ne: ''}},
  {'author.name': {$type: 'string', $ne: ''}},
  {desc: {$type: 'string', $ne: ''}},
  {story_ids: {$type: 'array'}}  // array of story ids written by this author
]}});

db.createCollection('comments', {validator: {$and: [
  {'author.id': {$type: 'string', $ne: ''}},  // will be 'anonymous' for anonymous users
  {'author.name': {$type: 'string', $ne: ''}},
  {story_id: {$type: 'objectId', $ne: ''}},
  {index: {$type: 'integer'}},  // the chapter number the comment was posted on
  {text: {$type: 'string', $ne: ''}}
]}});

// test data
const long = db.stories.insertOne({
  author: {id: '103655908568409015936', name: 'Guinevere Gilman'},
  title: "Long Story",
  summary: "The coolest story ever written.",
  chapters: [
    {title: 'Chapter 1', text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent efficitur laoreet lectus, et feugiat nulla bibendum vitae. Mauris lacinia nisi at tincidunt finibus. Vestibulum pharetra quam neque, id bibendum diam venenatis ac. Cras a eleifend felis. Ut in condimentum metus. Praesent tempor imperdiet nulla, et ultricies erat ultricies vitae. Suspendisse posuere pulvinar lacus sit amet ultrices. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Cras eu sollicitudin lectus, sed suscipit justo. Vestibulum aliquet, sem ac molestie molestie, libero ipsum auctor elit, eget dignissim leo est non erat. Suspendisse hendrerit tortor turpis, eleifend aliquam ligula luctus eu. Pellentesque ut nulla non augue interdum efficitur at eget ipsum. Nunc dictum lectus massa. Integer non nibh scelerisque, convallis purus in, suscipit ex. Nunc in suscipit ipsum.

    Nullam laoreet nulla nisl, vitae finibus lectus efficitur vitae. Curabitur lacus est, rutrum a tempor at, maximus ut eros. Fusce porttitor lobortis purus, non pellentesque ex molestie a. Quisque congue efficitur odio, id imperdiet elit. Fusce pretium suscipit diam non ornare. Vivamus nec elementum justo, sit amet rutrum augue. Pellentesque imperdiet nec nibh ac semper. Donec ac aliquam felis. Vestibulum cursus erat orci, id scelerisque diam tincidunt quis.

    Morbi aliquam mi quis ultricies facilisis. Nulla ut tempor dui. Integer eu cursus nulla. Suspendisse at convallis nibh. Donec mi neque, viverra vel nibh tincidunt, malesuada porta lorem. Suspendisse id rutrum lectus. Maecenas non malesuada mauris.

    Suspendisse convallis sed odio a interdum. Sed sit amet erat at velit rutrum ultrices. Quisque facilisis turpis nunc, tempor dapibus felis dignissim a. Proin cursus nulla vitae tortor finibus aliquet. Nullam mattis porta aliquet. Proin massa dui, posuere vitae dolor in, tincidunt dapibus ipsum. Curabitur id justo diam.

    Morbi ac turpis id odio fermentum pretium quis ac quam. Aliquam at varius neque. Nam convallis nisl sit amet augue ullamcorper congue. Pellentesque magna libero, dictum sed ipsum at, sollicitudin pretium neque. In at molestie erat, et euismod dui. Nulla eu accumsan augue, in ultrices odio. Aenean sodales mi sit amet augue tempus aliquam. Curabitur ut sodales felis, vitae sodales tellus.`
    },
    {title: 'Chapter 2', text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam faucibus tempor est, id ultrices quam lobortis vel. Integer mattis sollicitudin fringilla. Nulla finibus auctor elit, sit amet consequat turpis porta vitae. Nullam lectus quam, ultrices in odio consectetur, venenatis maximus leo. Donec eleifend suscipit laoreet. Vivamus eget nisl rutrum, maximus nibh quis, lobortis magna. Mauris fringilla mauris at lacus ullamcorper sodales. Quisque eget vestibulum justo. Donec eget lectus felis. Sed velit libero, tincidunt non sodales eu, tincidunt quis mauris. Nulla mollis nisi vitae dui varius elementum. Donec consequat nunc dui, ac ornare lacus commodo vitae. Aenean fringilla, leo non tristique tincidunt, enim diam rhoncus lorem, quis consequat risus arcu quis arcu. Nam mi sem, laoreet nec varius eget, dictum in eros. Aliquam erat volutpat. Pellentesque vehicula pharetra eros eu tincidunt.

    Nulla sit amet ligula ut nibh vestibulum cursus. Aliquam id viverra magna, in mollis magna. Nunc accumsan id dolor maximus semper. Phasellus ac pharetra arcu. Ut sed ultrices ligula. Quisque quis odio at ipsum accumsan rhoncus. Etiam at mauris ante.

    Sed eu aliquet risus. Sed eget dapibus turpis. Sed sagittis nibh in semper semper. Quisque imperdiet nisl nec auctor tempor. Donec ultricies massa arcu, in sollicitudin purus imperdiet ut. Vestibulum dapibus eros eget ornare eleifend. Aenean aliquet tellus mi, in consectetur lacus pharetra vitae. Aenean fermentum ex eu urna egestas vulputate. Vestibulum malesuada sapien eros, id tempus purus iaculis eget. Etiam vitae pellentesque augue. Integer placerat justo suscipit, iaculis turpis a, sagittis enim. Vivamus vitae turpis bibendum, rhoncus quam mollis, maximus velit. Ut non velit quis ipsum posuere imperdiet. Nam condimentum lectus et viverra feugiat. Curabitur in nibh quam.

    Aenean maximus interdum ex, id imperdiet justo lacinia id. Curabitur sagittis risus ut imperdiet volutpat. Fusce tempus dapibus augue vitae tristique. Pellentesque iaculis, elit pellentesque efficitur finibus, magna velit tempor arcu, et efficitur enim diam vitae diam. Duis dignissim viverra ipsum. Aliquam quis luctus augue, quis scelerisque sem. Interdum et malesuada fames ac ante ipsum primis in faucibus.

    Duis quis felis neque. Sed sit amet odio lorem. Donec suscipit vehicula orci, in condimentum mauris auctor in. Aenean sed sapien gravida elit volutpat cursus ut a urna. Nunc ultricies felis in ultricies posuere. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel nibh a sapien hendrerit volutpat vel nec odio. Duis interdum scelerisque quam, a consequat odio rhoncus in. Quisque odio ipsum, dignissim mollis scelerisque ut, consequat eget mauris. Cras et dolor tortor. Vivamus posuere cursus laoreet. Sed a molestie ligula. Nunc lorem nisl, pretium a velit vulputate, laoreet efficitur libero. Aliquam sed feugiat ipsum, at aliquam erat. Suspendisse sed laoreet lorem.`
  }],
  length: 2,
  tags: ["Sci-Fi", "Action"]
});

const short = db.stories.insertOne({
  author: {id: '100532274667147041257', name: 'Samuel Emerson'},
  title: 'Short Story',
  summary: "Just read it.",
  chapters: [
    {title: 'Chapter 1', text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non dignissim ligula, eu laoreet nisi. Vestibulum mauris felis, tempus ac rutrum in, interdum in lorem. Fusce dignissim maximus arcu. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Etiam odio tellus, volutpat sed elit non, mattis aliquet augue. Sed posuere convallis gravida. Nullam accumsan, erat ac volutpat faucibus, lacus massa cursus turpis, ut laoreet arcu elit ut est. Aenean efficitur orci vitae elit congue venenatis.

    Morbi sollicitudin fermentum lacinia. Cras non nibh ultricies, ultrices justo eu, iaculis metus. Donec scelerisque magna ac felis semper, nec facilisis nisi scelerisque. Morbi blandit mauris eget tortor efficitur feugiat. Cras justo ipsum, condimentum non semper sit amet, facilisis nec risus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras sed gravida ante, non mattis eros. Phasellus ultrices finibus ipsum, ut aliquet odio maximus eget. Vivamus massa orci, iaculis in metus id, luctus gravida mauris. Suspendisse eleifend eu leo ut maximus. Ut tempus facilisis nisl quis imperdiet. Pellentesque vel mi et turpis fringilla interdum at a lacus. Vivamus tempor ut tortor vel condimentum. Vivamus aliquam tristique nulla, in efficitur turpis hendrerit quis.

    Etiam vitae libero sed orci semper ultricies. Curabitur mattis nulla quis diam maximus tincidunt. Phasellus mollis lobortis augue, vel tincidunt orci pretium at. Morbi non lacus sit amet quam volutpat feugiat id ut ante. Morbi tristique nulla et hendrerit varius. Nulla blandit iaculis mattis. Donec sollicitudin congue nibh eget finibus. Phasellus in pellentesque tortor. Vestibulum bibendum venenatis dictum. In elementum, tellus scelerisque tempor tincidunt, ante arcu tincidunt arcu, at pretium erat ex non lectus. Nam dictum luctus sapien.

    Etiam lorem dui, aliquet id fermentum at, rutrum eget felis. Nulla in ligula orci. Integer rutrum, leo tempus cursus mattis, massa dolor laoreet neque, vitae ullamcorper mauris tellus vel magna. Integer lobortis massa at nulla aliquam congue et at augue. Vestibulum rhoncus eros sit amet aliquet venenatis. In ultrices magna ac pellentesque cursus. Proin in sollicitudin nulla, sit amet venenatis ante. Sed odio tellus, hendrerit at molestie at, consequat vel libero. Duis sollicitudin quam purus, in pulvinar mauris ultricies a. Etiam ex lorem, pretium sed mollis nec, iaculis id eros. Sed fermentum, turpis ac eleifend sodales, arcu sapien molestie enim, et bibendum mi libero et lacus.`
  }],
  length: 1,
  tags: ["Romance", "Comedy", "Parody"]
});

db.profiles.insertOne({
  author: {id: '103655908568409015936', name: 'Guinevere Gilman'},
  desc: "This is my profile. I don't have much to say, because my stories should speak for themselves. I only have one so far, but it's pretty amazing.",
  story_ids: [long.insertedId]
});

db.profiles.insertOne({
  author: {id: '100532274667147041257', name: 'Samuel Emerson'},
  desc: "I have a lot of good stories to share. If you like my stories, please consider favoriting them. Also follow me for more updates! Maybe when I'm not working on this project, I can actually write some.",
  story_ids: [short.insertedId]
});

db.comments.insertOne({
  author: {id: '100532274667147041257', name: 'Samuel Emerson'},
  story_id: long.insertedId,
  index: 1,
  text: "I can't believe you've written two whole chapters!"
});

db.comments.insertOne({
  author: {id: '103655908568409015936', name: 'Guinevere Gilman'},
  story_id: short.insertedId,
  index: 0,
  text: "Short but sweet."
});

db.profiles.createIndex({author: 1});
db.stories.createIndex({_id: 1});
db.stories.createIndex({tags: 1});
