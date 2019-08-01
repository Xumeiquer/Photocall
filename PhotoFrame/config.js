
const config = {};
const os = require('os');




config.CLIENT_SECRET = 'client_secret.json';
config.TOKEN_PATH = 'token.json';
config.oAuthClientID = process.env.CLIENT_ID;
config.oAuthclientSecret = process.env.CLIENT_SECRET;
config.oAuthCallbackUrl = process.env.CALLBACK_URL;
config.client_secret_file = process.env.CLIENT_SECRET_FILE;
config.token_info = process.env.TOKEN_INFO;

config.birds = ["Cagarnera", "Totestiu", "Pico gross", "Pico Tort", "Fumaet", "Papiroig", "Vilero", "Gafarro", "Gabachet", "Tord","Merla", "Periquito","Canari","Colomina", "Estornell","Falsía", "Palput" , "Pinsa", "Cagamanecs"];
config.colors = ["Roig/ja", "Negre/a", "Verd/a", "Taronja", "Gris", "Blau/Blava", "Blanc/a", "Groc", "Morat/da","Pardo/a","Rosa"];

const PHOTOCALLALBUM = process.env.PHOTOCALLALBUM || 'google id for photocall album';

//albumHidden [{title:'title', id:'google id'}]
config.albumHidden =  [ { title: 'Patricia y Jose Juan',
    id: 'google id' },
  { title: 'Para Novios',
    id: 'google id' },
  { title: 'Taula 14',
    id: 'google id'},
  {title: 'Taula 15',
    id:'google id'},
  {title: 'Taula 16',
    id:'google id'}
   ];

config.albumList =  { 
  'google id1':{title: 'Patricia y Jose Juan', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id2':{title: 'Taula 1', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id3':{title: 'Taula 2', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id4':{title: 'Taula 3', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id5':{title: 'Taula 4', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id6':{title: 'Taula 5', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id7':{title: 'Taula 6', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id8':{title: 'Taula 7', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id9':{title: 'Taula 8', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id10':{title: 'Taula 9', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id11':{title: 'Taula 10', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id12':{title: 'Taula 11', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id13':{title: 'Taula 12', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id14':{title: 'Taula 13', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id15':{title: 'Taula 14', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id16':{title: 'Taula 15', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id17':{title: 'Taula 16', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'google id18':{title: 'Para Novios', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false}
 };



config.paraNoviosAlbum='id_album_for_saving_videos';
config.photocallAlbum= PHOTOCALLALBUM;


const PORT = process.env.PORT || 8080;
config.port = PORT;


config.scopes =[
  'https://www.googleapis.com/auth/photoslibrary',
  'profile',
  ];


// The number of photos to load for search requests.
config.photosToLoad = 150;

// The page size to use for search requests. 100 is reccommended.
config.searchPageSize = 100;

// The page size to use for the listing albums request. 50 is reccommended.
config.albumPageSize = 50;

// The API end point to use. Do not change.
config.apiEndpoint = 'https://photoslibrary.googleapis.com';

module.exports = config;
