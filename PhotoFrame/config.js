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

// This file contains the configuration options for this sample app.

const config = {};
const os = require('os');



//TODO: QUITAR
// The OAuth client ID from the Google Developers console.
//config.oAuthClientID = '568943073861-5luad980f92ve8td5t734u2l744cuvtu.apps.googleusercontent.com';

// The OAuth client secret from the Google Developers console.
//config.oAuthclientSecret = 'ChggHFqL8iJ-hQKDSqYlGpLk';

// The callback to use for OAuth requests. This is the URL where the app is
// running. For testing and running it locally, use 127.0.0.1.
//config.oAuthCallbackUrl = 'https://photoframetest.herokuapp.com/auth/google/callback';//'http://127.0.0.1:80/auth/google/callback';//http://127.0.0.1:8080

//config.oAuthCallbackUrl = 'http://127.0.0.1:8080/auth/google/callback';//http://127.0.0.1:8080

// NEW CHANGES ADDED


config.CLIENT_SECRET = 'client_secret.json';
config.TOKEN_PATH = 'token.json';
config.oAuthClientID = process.env.CLIENT_ID;
config.oAuthclientSecret = process.env.CLIENT_SECRET;
config.oAuthCallbackUrl = process.env.CALLBACK_URL;
config.client_secret_file = process.env.CLIENT_SECRET_FILE;
config.token_info = process.env.TOKEN_INFO;

config.birds = ["Cagarnera", "Totestiu", "Pico gross", "Pico Tort", "Fumaet", "Papiroig", "Vilero", "Gafarro", "Gabachet", "Tord","Merla", "Periquito","Canari","Colomina", "Estornell","Falsía", "Palput" , "Pinsa", "Cagamanecs"];
config.colors = ["Roig/ja", "Negre/a", "Verd/a", "Taronja", "Gris", "Blau/Blava", "Blanc/a", "Groc", "Morat/da","Pardo/a","Rosa"];

const PHOTOCALLALBUM = process.env.PHOTOCALLALBUM || 'AL4nGe2RYeHIWRuzmM3mthvq4dDOW_sAmIIoRzcqOg9LpN_j5-t7DXTAYxmGVqw-WcNgVN_XdFnl';
//config.albumList = [{"title":"Mesa 1","id":""},{"title":"Mesa 2","id":""},{"title":"Mesa 3","id":""},{"title":"Mesa 4","id":""},{"title":"Mesa 5","id":""},{"title":"Mesa 6","id":""},{"title":"Mesa 7","id":""},{"title":"Mesa 8","id":""},{"title":"Mesa 9","id":""},{"title":"Mesa 10","id":""},{"title":"Mesa 11","id":""},{"title":"Mesa 12","id":""},{"title":"Mesa 13","id":""},{"title":"Mesa 14","id":""},{"title":"Mesa 15","id":""},{"title":"Mesa 16","id":""},{"title":"Para Novios","id":""}];
//config.albumHidden = [{"title":"Patricia y Jose Juan","id":PHOTOCALLALBUM},{"title":"Para Novios","id":""}];
/*
config.albumList = [ { title: 'Taula 1',
    id: 'AL4nGe3XEq-lufuHe73Q9mIKfTqQio37iBX2MSc380sWVMLlJdCT7ACJlsPpdqYanlcgOdBOcgrw' },
  { title: 'Taula 2',
    id: 'AL4nGe33PBj7Ad7vl7uvo1bgi6rDmK3h4sTDS_LFQrhXIlhcxECEk788sSZ4eD3JYBcThn-JCgC7' },
  { title: 'Taula 3',
    id: 'AL4nGe21Esgv5Yd2ylR-jlZWuS1W5qCyIkKrXVNyBS1wR4pfWz3fa6mcDXQmT-_WPFr_o-8r8wcr' },
  { title: 'Taula 4',
    id: 'AL4nGe03SYTS-hgd_3vsNqN_xU2l8Kp5aow-IrtZ0U_gXpt9CMos55f7jki2exODDD3Y-cn3WfmX' },
  { title: 'Taula 5',
    id: 'AL4nGe2e75P3eBYOOYW9r_I2A8PCJjaVWRP2SdodIAmTYjq_dzl96Oz4Amrkimi_iIbd-QPoB0le' },
  { title: 'Taula 6',
    id: 'AL4nGe0IBNg2qsqmzdbSeHaYvw23ixmT5-O6tIqPnE2QO7nP0pYKOBwn7PIkAXQ6gGKa2_MdgdfY' },
  { title: 'Taula 7',
    id: 'AL4nGe2YtElhF9pfj9OZq4RRakxa7DxsXoWmgwk54Uh4BOXooQ8cdhR4tbpUscV63UdAoF4JbHJ_' },
  { title: 'Taula 8',
    id: 'AL4nGe278rq2qXNT2ij5P2ZvUOfI8M2LeZ_BHMIwbjHaePfVsZNvzSFpC8rYmEupEh4l5mEm9D7Q' },
  { title: 'Taula 9',
    id: 'AL4nGe2TxLW3W5qaf3dRh-eWnIPu0b9dyRacEtiQLHHa-bil4sqSdD45i45mZgyjZ6JuHQ_0DtaM' },
  { title: 'Taula 10',
    id: 'AL4nGe0WjUCE1KpNYa6Mav7Td6MSr8kJRzPGGrwnZyMoinRCjrjRIzzw_m_UGGlb77m9I3CeoSoW' },
  { title: 'Taula 11',
    id: 'AL4nGe2bLOCN2sUYvdyexhWH-21JZ2_oF5ZHMxotlYqZiKfi0ncuh16ZecehF7EfImVAkJvTLhth' },
  { title: 'Taula 12',
    id: 'AL4nGe3EDDviSKJwwteyyMeSqxV6aVt9UXnfL21lx25_042YV60JtVIrk1I7Gw3rUdXjyPG8pzZj' },
  { title: 'Taula 13',
    id: 'AL4nGe1LXduXBUIDByL4AKXlO57QAb7ms2H0BBLB9i52Ef4kyxrVQ2zXSXCdGKD3sZJcNMSQMnsy' },
  { title: 'Taula 14',
    id: 'AL4nGe3K_t871gI2_aeSjYv81LiDDXJ2FZ4YoO9qZBqsazh4RUDXY0ZRYpUNU75-lh_5ifgso6h0' },
  { title: 'Taula 15',
    id: 'AL4nGe0N839MZGyFej7tQCeQBMqjVwDMYceMB9r-euk_UQeUwtG-bUpVtkCikab74bjIXIg3JTCf' },
  { title: 'Taula 16',
    id: 'AL4nGe1lpaSROAMWed0fsoeMX6iGC1uuVkl82M7PengVtlxDXZZ8RNQo2YKEO9V6GFfddns7KQu8' },
  { title: 'Para Novios',
    id: 'AL4nGe2p2HGb77M1yXxcGfVXP5HirGxfDQClU7sDB8v-fysXk-DmwSx0jJVILmi61-VYcVb6ldAj' } ];
*/
config.albumHidden =  [ { title: 'Patricia y Jose Juan',
    id: 'AL4nGe2RYeHIWRuzmM3mthvq4dDOW_sAmIIoRzcqOg9LpN_j5-t7DXTAYxmGVqw-WcNgVN_XdFnl' },
  { title: 'Para Novios',
    id: 'AL4nGe2p2HGb77M1yXxcGfVXP5HirGxfDQClU7sDB8v-fysXk-DmwSx0jJVILmi61-VYcVb6ldAj' },
  { title: 'Taula 14',
    id: 'AL4nGe3K_t871gI2_aeSjYv81LiDDXJ2FZ4YoO9qZBqsazh4RUDXY0ZRYpUNU75-lh_5ifgso6h0'},
  {title: 'Taula 15',
    id:'AL4nGe0N839MZGyFej7tQCeQBMqjVwDMYceMB9r-euk_UQeUwtG-bUpVtkCikab74bjIXIg3JTCf'},
  {title: 'Taula 16',
    id:'AL4nGe1lpaSROAMWed0fsoeMX6iGC1uuVkl82M7PengVtlxDXZZ8RNQo2YKEO9V6GFfddns7KQu8'}
   ];

config.albumList =  { 
  'AL4nGe2RYeHIWRuzmM3mthvq4dDOW_sAmIIoRzcqOg9LpN_j5-t7DXTAYxmGVqw-WcNgVN_XdFnl':{title: 'Patricia y Jose Juan', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe3XEq-lufuHe73Q9mIKfTqQio37iBX2MSc380sWVMLlJdCT7ACJlsPpdqYanlcgOdBOcgrw':{title: 'Taula 1', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe33PBj7Ad7vl7uvo1bgi6rDmK3h4sTDS_LFQrhXIlhcxECEk788sSZ4eD3JYBcThn-JCgC7':{title: 'Taula 2', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe21Esgv5Yd2ylR-jlZWuS1W5qCyIkKrXVNyBS1wR4pfWz3fa6mcDXQmT-_WPFr_o-8r8wcr':{title: 'Taula 3', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe03SYTS-hgd_3vsNqN_xU2l8Kp5aow-IrtZ0U_gXpt9CMos55f7jki2exODDD3Y-cn3WfmX':{title: 'Taula 4', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe2e75P3eBYOOYW9r_I2A8PCJjaVWRP2SdodIAmTYjq_dzl96Oz4Amrkimi_iIbd-QPoB0le':{title: 'Taula 5', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe0IBNg2qsqmzdbSeHaYvw23ixmT5-O6tIqPnE2QO7nP0pYKOBwn7PIkAXQ6gGKa2_MdgdfY':{title: 'Taula 6', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe2YtElhF9pfj9OZq4RRakxa7DxsXoWmgwk54Uh4BOXooQ8cdhR4tbpUscV63UdAoF4JbHJ_':{title: 'Taula 7', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe278rq2qXNT2ij5P2ZvUOfI8M2LeZ_BHMIwbjHaePfVsZNvzSFpC8rYmEupEh4l5mEm9D7Q':{title: 'Taula 8', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe2TxLW3W5qaf3dRh-eWnIPu0b9dyRacEtiQLHHa-bil4sqSdD45i45mZgyjZ6JuHQ_0DtaM':{title: 'Taula 9', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe0WjUCE1KpNYa6Mav7Td6MSr8kJRzPGGrwnZyMoinRCjrjRIzzw_m_UGGlb77m9I3CeoSoW':{title: 'Taula 10', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe2bLOCN2sUYvdyexhWH-21JZ2_oF5ZHMxotlYqZiKfi0ncuh16ZecehF7EfImVAkJvTLhth':{title: 'Taula 11', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe3EDDviSKJwwteyyMeSqxV6aVt9UXnfL21lx25_042YV60JtVIrk1I7Gw3rUdXjyPG8pzZj':{title: 'Taula 12', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe1LXduXBUIDByL4AKXlO57QAb7ms2H0BBLB9i52Ef4kyxrVQ2zXSXCdGKD3sZJcNMSQMnsy':{title: 'Taula 13', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe3K_t871gI2_aeSjYv81LiDDXJ2FZ4YoO9qZBqsazh4RUDXY0ZRYpUNU75-lh_5ifgso6h0':{title: 'Taula 14', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe0N839MZGyFej7tQCeQBMqjVwDMYceMB9r-euk_UQeUwtG-bUpVtkCikab74bjIXIg3JTCf':{title: 'Taula 15', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe1lpaSROAMWed0fsoeMX6iGC1uuVkl82M7PengVtlxDXZZ8RNQo2YKEO9V6GFfddns7KQu8':{title: 'Taula 16', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false},
  'AL4nGe2p2HGb77M1yXxcGfVXP5HirGxfDQClU7sDB8v-fysXk-DmwSx0jJVILmi61-VYcVb6ldAj':{title: 'Para Novios', existing:0,saved:0, cache:null,lastUpdate:-1, updating:false}
 };



config.paraNoviosAlbum='AL4nGe2p2HGb77M1yXxcGfVXP5HirGxfDQClU7sDB8v-fysXk-DmwSx0jJVILmi61-VYcVb6ldAj';
config.photocallAlbum= PHOTOCALLALBUM;

//console.log(os.hostname())
// The port where the app should listen for requests.
//config.port = 80;//8080

const PORT = process.env.PORT || 8080;
config.port = PORT;

//console.log("PORT?" + PORT);

// The scopes to request. The app requires the photoslibrary.readonly and
// plus.me scopes.
/*config.scopes = [
  'https://www.googleapis.com/auth/photoslibrary.readonly',
  'profile',
];*/

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
