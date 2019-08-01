// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START app]

const async = require('async');
const bodyParser = require('body-parser');
const config = require('./config.js');
const express = require('express');
const expressWinston = require('express-winston');
const http = require('http');
const persist = require('node-persist');
const request = require('request-promise');
const session = require('express-session');
const sessionFileStore = require('session-file-store');
const uuid = require('uuid');
const winston = require('winston');

/* upload from page required packages */
const formidable = require('formidable');
//const readChunk = require('read-chunk');
//const fileType = require('file-type');
//const path = require('path');
const fs = require('fs');

const util = require('util');

//const os = require('os')
const app = express();
const fileStore = sessionFileStore(session);
const server = http.Server(app);

// merge images
//const mergeImages = require('merge-images');
//const Canvas = require('canvas');
var Jimp = require('jimp');


//const datetime = require('node-datetime');
var listOfNames = [];
var photocallTime = -1;
var updatingPhotocall = false;
var photocallPhotos = 0;

//var timestampTest = datetime.create().epoch();

// Use the EJS template engine
app.set('view engine', 'ejs');


// Set up a cache for media items that expires after 55 minutes.
// This caches the baseUrls for media items that have been selected
// by the user for the photo frame. They are used to display photos in
// thumbnails and in the frame. The baseUrls are send to the frontend and
// displayed from there. The baseUrls are cached temporarily to ensure that the
// app is responsive and quick. Note that this data should only be stored for a
// short amount of time and that access to the URLs expires after 60 minutes.
// See the 'best practices' and 'acceptable use policy' in the developer
// documentation.

for (var key in config.albumList){
  //console.log("config[",key,"]:", config.albumList[key]);
  config.albumList[key].cache = persist.create({
    dir: 'persist-mediaitemcache/',
    ttl: 1200000,  // 55 minutes // TODO: Changed to 2 minutes
  });
  config.albumList[key].cache.init();
}

//console.log("config albumlist:", config.albumList);

// Temporarily cache a list of the albums owned by the user. This caches
// the name and base Url of the cover image. This ensures that the app
// is responsive when the user picks an album.
// Loading a full list of the albums owned by the user may take multiple
// requests. Caching this temporarily allows the user to go back to the
// album selection screen without having to wait for the requests to
// complete every time.
// Note that this data is only cached temporarily as per the 'best practices' in
// the developer documentation. Here it expires after 10 minutes.
const albumCache = persist.create({
  dir: 'persist-albumcache/',
  ttl: 30000,  // 10 minutes //TODO: CHanged to 5min
});
albumCache.init();

// For each user, the app stores the last search parameters or album
// they loaded into the photo frame. The next time they log in
// (or when the cached data expires), this search is resubmitted.
// This keeps the data fresh. Instead of storing the search parameters,
// we could also store a list of the media item ids and refresh them,
// but resubmitting the search query ensures that the photo frame displays
// any new images that match the search criteria (or that have been added
// to an album).
const storage = persist.create({dir: 'persist-storage/'});
storage.init();

// Set up OAuth 2.0 authentication through the passport.js library.
const passport = require('passport');

///TODO: DISABLED
const auth = require('./auth');
//auth(passport);
auth.authenticate(); //callback added
var albumsChecked = true;

// Set up a session middleware to handle user sessions.
// NOTE: A secret is used to sign the cookie. This is just used for this sample
// app and should be changed.
const sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  store: new fileStore({}),
  secret: 'PlanB photoframe',
});

// Console transport for winton.
const consoleTransport = new winston.transports.Console();

// Set up winston logging.
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
    ),
  transports: [
  consoleTransport
  ]
});

// Enable extensive logging if the DEBUG environment variable is set.
if (process.env.DEBUG) {
  // Print all winston log levels.
  logger.level = 'silly';

  // Enable express.js debugging. This logs all received requests.
  app.use(expressWinston.logger({
    transports: [
    consoleTransport
    ],
    winstonInstance: logger
  }));
  // Enable request debugging.
  require('request-promise').debug = true;
} else {
  // By default, only print all 'verbose' log level messages or below.
  logger.level = 'verbose';
}


// Set up static routes for hosted libraries.
app.use(express.static('static'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use(
  '/fancybox',
  express.static(__dirname + '/node_modules/@fancyapps/fancybox/dist/'));
app.use(
  '/mdlite',
  express.static(__dirname + '/node_modules/material-design-lite/dist/'));


// Parse application/json request data.
app.use(bodyParser.json());

// Parse application/xwww-form-urlencoded request data.
app.use(bodyParser.urlencoded({extended: true}));

// Enable user session handling.
app.use(sessionMiddleware);

// Set up passport and session handling.
app.use(passport.initialize());
app.use(passport.session());



function getRandomName(){
  var n = config.birds.length;
  var m = config.colors.length;

  console.log("N:", n, " - M:", m);
  var count = n*m;
  var endloop = false;
  var name="";
  while(!endloop){
    name = config.birds[parseInt(Math.random() * (n))] +' ' +  config.colors[parseInt(Math.random() * (m))];
    if(listOfNames.indexOf(name)==-1){
      listOfNames.push(name);
      endloop=true;
    }else
    count -=1;
    if(count<=0)
      endloop=true;
  }
  if(count<=0){
    name= name + " - " + listOfNames.length;
    listOfNames.push(name);
  }
  console.log("list of names:", listOfNames);
  return name;
}


// Middleware that adds the user of this session as a local variable,
// so it can be displayed on all pages when logged in.
app.use((req, res, next) => {
  //res.locals.name = '-';
  var session = req.session;

  if(req.body && req.body.title){
    session["album"] = req.body.title;
    res.locals.album = req.body.title;
  }else{
    res.locals.album = session["album"];
  }

  console.log("session name:", session["name"]);
  if(typeof session["name"] == 'undefined')
    session["name"] = getRandomName();
  else{
    if(listOfNames.indexOf(session["name"])==-1){
      listOfNames.push(session["name"]);
    }
  }
  res.locals.name = session["name"];
  if (req.user && req.user.profile && req.user.profile.name) {
    res.locals.name =
    req.user.profile.name.givenName || req.user.profile.displayName;
  }

  res.locals.avatarUrl = '';
  if (req.user && req.user.profile && req.user.profile.photos) {
    res.locals.avatarUrl = req.user.profile.photos[0].value;
  }

  if(albumsChecked == false){
    albumsChecked = checkAlbums();

  }
  next();
});


// GET request to the root.
// Display the login screen if the user is not logged in yet, otherwise the
// photo frame.
app.get('/', (req, res) => {
    res.render('pages/photocall');//TODO: CHanged pages/frame
 // }
});

// GET request to log out the user.
// Destroy the current session and redirect back to the log in screen.
app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});



// Loads the search page if the user is authenticated.
// This page includes the search form.
app.get('/search', (req, res) => {
  renderIfAuthenticated(req, res, 'pages/search');
});

// Loads the album page if the user is authenticated.
// This page displays a list of albums owned by the user.
app.get('/album', (req, res) => {
  renderIfAuthenticated(req, res, 'pages/album');
});




// Handles form submissions from the search page.
// The user has made a selection and wants to load photos into the photo frame
// from a search query.
// Construct a filter and submit it to the Library API in
// libraryApiSearch(authToken, parameters).
// Returns a list of media items if the search was successful, or an error
// otherwise.
app.post('/loadFromSearch', async (req, res) => {

  const authToken = await token();

  logger.info('Loading images from search.');
  logger.silly('Received form data: ', req.body);

  // Construct a filter for photos.
  // Other parameters are added below based on the form submission.
  const filters = {contentFilter: {}, mediaTypeFilter: {mediaTypes: ['PHOTO']}};

  if (req.body.includedCategories) {
    // Included categories are set in the form. Add them to the filter.
    filters.contentFilter.includedContentCategories =
    [req.body.includedCategories];
  }

  if (req.body.excludedCategories) {
    // Excluded categories are set in the form. Add them to the filter.
    filters.contentFilter.excludedContentCategories =
    [req.body.excludedCategories];
  }

  // Add a date filter if set, either as exact or as range.
  if (req.body.dateFilter == 'exact') {
    filters.dateFilter = {
      dates: constructDate(
        req.body.exactYear, req.body.exactMonth, req.body.exactDay),
    }
  } else if (req.body.dateFilter == 'range') {
    filters.dateFilter = {
      ranges: [{
        startDate: constructDate(
          req.body.startYear, req.body.startMonth, req.body.startDay),
        endDate:
        constructDate(req.body.endYear, req.body.endMonth, req.body.endDay),
      }]
    }
  }

  // Create the parameters that will be submitted to the Library API.
  const parameters = {filters};

  // Submit the search request to the API and wait for the result.
  const data = await libraryApiSearch(authToken, parameters);

  // Return and cache the result and parameters.
  const userId = req.session["name"];//req.user.profile.id;
  //TODO:SETCACHE
  const albumUserId = "Belino";

  returnPhotos(res, userId,albumUserId, data, parameters);
});

// Handles selections from the album page where an album ID is submitted.
// The user has selected an album and wants to load photos from an album
// into the photo frame.
// Submits a search for all media items in an album to the Library API.
// Returns a list of photos if this was successful, or an error otherwise.
app.post('/loadFromAlbum', async (req, res) => {
  const albumId = req.body.albumId;
  //const userId = req.user.profile.id;
  //TODO:SETCACHE
  const userId = req.session["name"];
  const albumUserId = "Belino";
  const authToken = await token();

  logger.info(`Importing album: ${albumId}`);

  // To list all media in an album, construct a search request
  // where the only parameter is the album ID.
  // Note that no other filters can be set, so this search will
  // also return videos that are otherwise filtered out in libraryApiSearch(..).
  const parameters = {albumId};

  // Submit the search request to the API and wait for the result.
  const data = await libraryApiSearch(authToken, parameters);

  returnPhotos(res, userId,albumUserId,  data, parameters);
});

// Returns all albums owned by the user.
app.get('/getAlbums', async (req, res) => {
  logger.info('Loading albums');
  //TODO:CHANGED
  //const userId = req.user.profile.id;
  const userId = req.session["name"];
  //res.locals.album = req.body.title;
  // Attempt to load the albums from cache if available.
  // Temporarily caching the albums makes the app more responsive.

  const authToken = await token();
  
  const cachedAlbums = await albumCache.getItem(userId);
  if (cachedAlbums) {
    logger.verbose('Loaded albums from cache.');
    res.status(200).send(cachedAlbums);
  } else {
    logger.verbose('Loading albums from API.');
    // Albums not in cache, retrieve the albums from the Library API
    // and return them
    //TODO:CHANGED
    const data = await libraryApiGetAlbums(authToken);//req.user.token);
    if (data.error) {
      // Error occured during the request. Albums could not be loaded.
      returnError(res, data);
      // Clear the cached albums.
      albumCache.removeItem(userId);
    } else {
      // Albums were successfully loaded from the API. Cache them
      // temporarily to speed up the next request and return them.
      // The cache implementation automatically clears the data when the TTL is
      // reached.
      res.status(200).send(data);
      albumCache.setItemSync(userId, data);
    }
  }
});


// Returns a list of the media items that the user has selected to
// be shown on the photo frame.
// If the media items are still in the temporary cache, they are directly
// returned, otherwise the search parameters that were used to load the photos
// are resubmitted to the API and the result returned.


app.get('/getQueue', async (req, res) => {
  //TODO:CHANGED
  //const userId = req.user.profile.id;
  const userId = req.session["name"];
  const albumUserId = "Belino";
  const authToken= await token();

  logger.info('Loading queue.');

  console.log("album:", req.query);

  // Attempt to load the queue from cache first. This contains full mediaItems
  // that include URLs. Note that these expire after 1 hour. The TTL on this
  // cache has been set to this limit and it is cleared automatically when this
  // time limit is reached. Caching this data makes the app more responsive,
  // as it can be returned directly from memory whenever the user navigates
  // back to the photo frame.

  //const cachedPhotos = await mediaItemCache.getItem(userId);
  var stored = await storage.getItem(userId);
  
  
  if(req.query.album=="photocall"){
    stored = {parameters:{albumId:config.photocallAlbum}};
  }

  console.log("parameters:", stored);
  if(stored != undefined)
    var cachedPhotos = await config.albumList[stored.parameters.albumId].cache.getItem(albumUserId);
  else
    var cachedPhotos = false;

  

  if (cachedPhotos && config.albumList[stored.parameters.albumId].existing == config.albumList[stored.parameters.albumId].saved && config.albumList[stored.parameters.albumId].updating==false) {
    // Items are still cached. Return them.
    logger.verbose('Returning cached photos.');
    console.log("res.locals.album(getqueue):", res.locals.album);
    console.log("STORED PARAMETERES:", stored.parameters);
    res.status(200).send({photos: cachedPhotos, parameters: stored.parameters, title: res.locals.album});
  } else if (stored && stored.parameters) {
    // Items are no longer cached. Resubmit the stored search query and return
    // the result.

    config.albumList[stored.parameters.albumId].updating=true;

    logger.verbose(
      `Resubmitting filter search ${JSON.stringify(stored.parameters)}`);
    const data = await libraryApiSearch(authToken, stored.parameters);
    returnPhotos(res, userId, albumUserId, data, stored.parameters);
  } else {
    // No data is stored yet for the user. Return an empty response.
    // The user is likely new.
    logger.verbose('No cached data.')
    res.status(200).send({});
  }
});


app.use("/oauthCallback", function(req, res) {
  var oauth2Client = auth.getOAuthClient();
  var session = req.session;
  var code = req.query.code;
  console.log("Authenticated for first time");
  logger.info('Authenticated for first time');
  oauth2Client.getToken(code, function(err, tokens) {
        //console.log("tokens : ", tokens);
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        if (!err) {
          auth.saveToken(oauth2Client, tokens);

          session["tokens"] = tokens;

          res.redirect('/');
        } else {
          console.log("ERROR:", err);
          res.send(`
            <html>
            <body>
            <h3>Login failed!!</h3>

            </body>
            </html>
            `);
        }
      });
});

//TODO: added new page
app.get('/frame', (req, res) => {
    
  if(typeof res.locals.album !=='undefined'){
    renderIfAuthenticated(req, res, 'pages/frame');
  }else{
      renderIfAuthenticated(req, res, 'pages/album');
  }
});

app.get('/upload', (req, res) => {
  renderIfAuthenticated(req, res, 'pages/upload');
});

app.get('/disclaimer', (req, res) => {
  renderIfAuthenticated(req, res, 'pages/disclaimer');
});



app.post('/uploadFile',async(req,res) => {
  const authToken = await token();
  const userId = req.session["name"];
  const stored = await storage.getItem(userId);

  logger.info("Uploading file from user:", userId, " to album:" , JSON.stringify(stored.parameters));;



 var photos = [];
 var form = new formidable.IncomingForm();

 form.multiples = true;

 
 form.on('file', async (name, file)=>{

     console.log("File name:", file.name);
     console.log("File path:", file.path);
    /* console.log("File:", file); 
*/
     var uploadToken;
    if(file.type.startsWith('video/')){
      console.log("Video type");
      uploadToken = await libraryApiUploadMedia(authToken, file.path,config.paraNoviosAlbum, userId);
    }else{
      /*Jimp.read(file.path)
        .then(tpl=> (tpl.clone().write('./image.jpg')))
        .then(()=> Jimp.read('./image.jpg'))
        .then(tpl => (
          Jimp.read('./logo2000.png').then(logoTpl =>{
            //logoTpl.opacity(0.2);
            return tpl.composite(logoTpl);
          })))
        .then(tpl => (tpl.quality(100).write(userId + ".jpg")))
        .then(tpl =>{ console.log("exported file:" + userId + ".jpg");})
        .catch(err =>{ console.error(err);});

*/



      console.log("Other type:", file.type);
      uploadToken = await libraryApiUploadMedia(authToken, file.path,stored.parameters.albumId, userId);
     }
   });

  form.on('error', function(err) {
      console.log('Error occurred during processing - ' + err);
    });

    // Invoked when all the fields have been processed.
    form.on('end', function() {

      console.log('All the request fields have been processed.');
    });

    // Parse the incoming form fields.
    form.parse(req, function (err, fields, files) {
      console.log("parse function");

        res.status(200).send({});//json(photos);
      });

});



app.get('/newFiles', async(req,res) => {
  logger.info("Required update");
  console.log("query:", req.query);
  console.log("album:", req.query.album);
  var album="";

  
  try{
    album = JSON.parse(req.query.album).albumId;
  }catch (err){
    album =req.query.album.substring(1,req.query.album.length -1);
  }

  if(album=="-" || album == 'No photo search selected'){
    res.status(200).send({result:false});  
    return;
  }


  var time = req.query.time;
  var photos = req.query.number;
  var answerUpdate = false;
  var diff = 0;
  

  if(photocallTime<0){
      console.log("update for first time");
      photocallTime = time;
  }else{

      if(time - photocallTime > 10000){  //TODO: Change for const value
        photocallTime = time;
        console.log("to update:", time - photocallTime);

        const authToken = await token();
        const data = await libraryApiGetAlbums(authToken, true);

        console.log("data.albums.lenght:", data.albums.length);

        for(var i=0; i< data.albums.length; i++){//var i=0; i<data.length; i++){
          

          config.albumList[data.albums[i].id].existing = data.albums[i].mediaItemsCount;
         
          if(data.albums[i].id == album){
            diff = data.albums[i].mediaItemsCount - photos;
          }

        }

      }else{
        if(config.albumList[album].existing!=0)
          diff = config.albumList[album].existing - photos;
      }
   

  }

  if(diff !=0){
    res.status(200).send({result:diff});
  }else{
    res.status(200).send({result:false});  
  }
  
});






// Start the server
server.listen(config.port, () => {
  console.log(`App listening on port ${config.port}`);
  console.log('Press Ctrl+C to quit.');

 // checkAlbums();
});


//TODO: UPDATE TO THE NEW FORMAT of ALBUMLIST
async function checkAlbums(){
  const authToken = await  token();
  console.log("checkAlbums:", authToken);
  if(typeof authToken =='undefined'){
    //console.log("returning oaut2client");
    return false;  
  }
  else{
    const albumList = await libraryApiGetAlbums(authToken, true);
    console.log("List of Albums:", albumList);
    console.log("Existing list:", config.albumList);

    //console.log("Albums:", albumList['albums']);
    var list = albumList.albums;
    var title ="";
    var found = false;
    for(var i in config.albumList){
      
//      console.log(config.albumList[i]);
      
      found = false;
      for(var j in list){
        //console.log("album list of j", list[j].title);
        if(list[j].title == config.albumList[i].title){
          found = true;
          config.albumList[i].id=list[i].id;
          break;
        }

      }

      if(found == false){
        console.log("Create album:", config.albumList[i].title);
        let id = await libraryApiCreateAlbum(authToken,config.albumList[i].title );
        config.albumList[i].id =id; 

      }
    }
    console.log("albumlist after:", config.albumList);

    for(var i in config.albumHidden){
      for(var j in list){
        if(list[j].title == config.albumHidden[i].title){
          config.albumHidden[i].id=list[i].id;
          break;
        }

      }
    }

    console.log("Hidden List:", config.albumHidden);
    return true;
  }
}


// Renders the given page if the user is authenticated.
// Otherwise, redirects to "/".
function renderIfAuthenticated(req, res, page) {

  //NOTE: No authentication needed, as each function that needs a token, calls Token() and it is updated
  res.render(page);
 
}

// If the supplied result is succesful, the parameters and media items are
// cached.
// Helper method that returns and caches the result from a Library API search
// query returned by libraryApiSearch(...). If the data.error field is set,
// the data is handled as an error and not cached. See returnError instead.
// Otherwise, the media items are cached, the search parameters are stored
// and they are returned in the response.
function returnPhotos(res, userId,albumUserId, data, searchParameter) {
  console.log("returnPhotos");
  console.log("userID:", userId);
  console.log("albumUserId:", albumUserId);
  console.log("searchParameters:", searchParameter);
  console.log("data:", data.photos.length);

  if (data.error) {
    returnError(res, data)
  } else {
    // Remove the pageToken and pageSize from the search parameters.
    // They will be set again when the request is submitted but don't need to be
    // stored.
    delete searchParameter.pageToken;
    delete searchParameter.pageSize;

    // Cache the media items that were loaded temporarily.
    //mediaItemCache.setItemSync(userId, data.photos);
    config.albumList[searchParameter.albumId].cache.setItemSync(albumUserId, data.photos);



    // Store the parameters that were used to load these images. They are used
    // to resubmit the query after the cache expires.
    if(searchParameter.albumId != config.photocallAlbum)
      storage.setItemSync(userId, {parameters: searchParameter});

    config.albumList[searchParameter.albumId].updating=false;
    config.albumList[searchParameter.albumId].saved=data.photos.length;


    // Return the photos and parameters back int the response.
    res.status(200).send({photos: data.photos, parameters: searchParameter, title: res.locals.album});
  }
}


// Responds with an error status code and the encapsulated data.error.
function returnError(res, data) {
  // Return the same status code that was returned in the error or use 500
  // otherwise.
  const statusCode = data.error.code || 500;
  // Return the error.
  res.status(statusCode).send(data.error);
}

// Constructs a date object required for the Library API.
// Undefined parameters are not set in the date object, which the API sees as a
// wildcard.
function constructDate(year, month, day) {
  const date = {};
  if (year) date.year = year;
  if (month) date.month = month;
  if (day) date.day = day;
  return date;
}


async function token(){
  const AT = await auth.getToken();
  return AT;
}


function filterSelect(valuesObj, valuesToRemoveObj){
  //console.log("valuesObj:", valuesObj);
  //console.log("valuesToRemoveObj:", valuesToRemoveObj);
  let albums = [];
  var filter = false;
  for(var j in valuesObj){
    filter = false;
    for(var i in valuesToRemoveObj){
    
      if(valuesObj[j].id == valuesToRemoveObj[i].id){
        filter = true;
        break;
      }
    }
    if(filter==false)
        albums.push(valuesObj[j]);    
    }
  
  
  //console.log("filterSelect:", albums);

  return albums
}

async function libraryApiCreateAlbum(authToken, parameters){
  let albumId = '' ;
  let nextPageToken = null;
  let error = null;

  //parameters.pageSize = config.searchPageSize;
  console.log("libApiCreateAlbum for:", parameters);
  var body = { "album":{"title":parameters}};

  console.log("Body:", body);

  try {
    // Loop while the number of photos threshold has not been met yet
    // and while there is a nextPageToken to load more items.
    
      
      
      const result = await request.post(config.apiEndpoint + '/v1/albums', {
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        json: body,
        auth: {'bearer': authToken},
      });

      logger.info(`Response: ${result}`);
      albumId = result.id;

  } catch (err) {
    // If the error is a StatusCodeError, it contains an error.error object that
    // should be returned. It has a name, statuscode and message in the correct
    // format. Otherwise extract the properties.
    error = err.error.error ||
    {name: err.name, code: err.statusCode, message: err.message};
    logger.error(error);
  }

  logger.info('Creation complete.');
  return albumId;

}

// Submits a search request to the Google Photos Library API for the given
// parameters. The authToken is used to authenticate requests for the API.
// The minimum number of expected results is configured in config.photosToLoad.
// This function makes multiple calls to the API to load at least as many photos
// as requested. This may result in more items being listed in the response than
// originally requested.
async function libraryApiSearch(authToken, parameters) {
  let photos = [];
  let nextPageToken = null;
  let error = null;

  parameters.pageSize = config.searchPageSize;

  try {
    // Loop while the number of photos threshold has not been met yet
    // and while there is a nextPageToken to load more items.
    do {
      logger.info(
        `Submitting search with parameters: ${JSON.stringify(parameters)}`);

      // Make a POST request to search the library or album
      const result =
      await request.post(config.apiEndpoint + '/v1/mediaItems:search', {
        headers: {'Content-Type': 'application/json'},
        json: parameters,
        auth: {'bearer': authToken},
      });

      logger.debug(`Response: ${result}`);

      // The list of media items returned may be sparse and contain missing
      // elements. Remove all invalid elements.
      // Also remove all elements that are not images by checking its mime type.
      // Media type filters can't be applied if an album is loaded, so an extra
      // filter step is required here to ensure that only images are returned.
      const items = result && result.mediaItems ?
      result.mediaItems
              .filter(x => x)  // Filter empty or invalid items.
              // Only keep media items with an image mime type.
              /*.filter(x => x.mimeType && x.mimeType.startsWith('image/')) */:
              [];

              photos = photos.concat(items);


    /*  console.log("MEDIAITEMS NOFILTER:", result.mediaItems);
      console.log("MEDIAITEMS FILTER1:", result.mediaItems.filter(x=>x));
      console.log("MEDIAITEMS FILTER1Y2:", result.mediaItems.filter(x=>x).filter(x=> x.mimeType && x.mimeType.startsWith('image/')));
      console.log("MEDIAITEMS FILTER1Y2:", result.mediaItems.filter(x=> x.mimeType && x.mimeType.startsWith('image/')));
*/

      // Set the pageToken for the next request.
      parameters.pageToken = result.nextPageToken;

      logger.verbose(
        `Found ${items.length} images in this request. Total images: ${
          photos.length}`);

      // Loop until the required number of photos has been loaded or until there
      // are no more photos, ie. there is no pageToken.
    } while (photos.length < config.photosToLoad &&
     parameters.pageToken != null);

  } catch (err) {
    // If the error is a StatusCodeError, it contains an error.error object that
    // should be returned. It has a name, statuscode and message in the correct
    // format. Otherwise extract the properties.
    error = err.error.error ||
    {name: err.name, code: err.statusCode, message: err.message};
    logger.error(error);
  }

  logger.info('Search complete.');
  return {photos, parameters, error};
}



// Returns a list of all albums owner by the logged in user from the Library
// API.
async function libraryApiGetAlbums(authToken, showHidden=false) {
  let albums = [];
  let nextPageToken = null;
  let error = null;
  let parameters = {pageSize: config.albumPageSize};

  try {
    // Loop while there is a nextpageToken property in the response until all
    // albums have been listed.
    do {
      logger.verbose(`Loading albums. Received so far: ${albums.length}`);
      // Make a GET request to load the albums with optional parameters (the
      // pageToken if set).
      const result = await request.get(config.apiEndpoint + '/v1/albums', {
        headers: {'Content-Type': 'application/json'},
        qs: parameters,
        json: true,
        auth: {'bearer': authToken},
      });

      logger.debug(`Response: ${result}`);

      if (result && result.albums) {
        logger.verbose(`Number of albums received: ${result.albums.length}`);
        // Parse albums and add them to the list, skipping empty entries.
        const items = result.albums.filter(x => !!x);

        if(showHidden){
          albums = albums.concat(items);
        }
        else{
          albums = filterSelect(items, config.albumHidden);//.sort((a,b)=>(a.title > b.title) && (a.title.length > b.title.length)).reverse();
        }
        
   
      }
      parameters.pageToken = result.nextPageToken;
      // Loop until all albums have been listed and no new nextPageToken is
      // returned.
    } while (parameters.pageToken != null);

  } catch (err) {
    // If the error is a StatusCodeError, it contains an error.error object that
    // should be returned. It has a name, statuscode and message in the correct
    // format. Otherwise extract the properties.
   // error = err.error.error ||
    //{name: err.name, code: err.statusCode, message: err.message};
    logger.error(err);//error);
  }

  logger.info('Albums loaded.');
  return {albums, error};
}


async function libraryApiUploadMedia(authToken, filepath,album, userId){
  let albums = [];
  let uploadToken = null;
  let error = null;
  let file = fs.readFileSync(filepath);

  try{
   logger.verbose(`Uploading Media.`);
      // Make a GET request to load the albums with optional parameters (the
      // pageToken if set).
      const result = await request.post(config.apiEndpoint + '/v1/uploads', {
        headers: {'Content-Type': 'application/octet-stream', 'X-Goog-Upload-File-Name': file.name, 'X-Goog-Upload-Protocol': 'raw'},
        body: file,
        auth: {'bearer': authToken},
      });

      logger.verbose(`Response: ${result}`);
      

      var bodyItem = {
        "albumId": album,
        "newMediaItems": [
        {
         "description": "Foto subida por: " + userId,
         "simpleMediaItem": {
          "uploadToken": result
        }
      }

      ]
    };

    const result2 = await request.post(config.apiEndpoint + '/v1/mediaItems:batchCreate', {
      headers: {'Content-Type': 'application/json'},
      json: bodyItem,
      auth: {'bearer': authToken},
    });

    logger.verbose("Response 2:",result2);
    console.log(util.inspect(result2, false,null,true));

  }catch (err){
   // error = err.error.error || {name: err.name, code: err.statusCode, message:err.message};
   error = err;
   logger.error(err);
 }
 return {uploadToken, error};
}



// [END app]
