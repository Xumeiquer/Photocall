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

const config = require('./config.js');

//TODO: ADDED
const fs = require('fs');
const readline = require('readline');
var {google} = require('googleapis');

const auth={};
oAuth2Object = undefined;

//ORIGINAL
/*
const GoogleOAuthStrategy = require('passport-google-oauth20').Strategy;
module.exports = (passport) => {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
  passport.use(new GoogleOAuthStrategy(
  {
    clientID: config.oAuthClientID,
    clientSecret: config.oAuthclientSecret,
    callbackURL: config.oAuthCallbackUrl,
        // Set the correct profile URL that does not require any additional APIs
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
      },
      (token, refreshToken, profile, done) => done(null, {profile, token})));
};
*/

//TODO: ADDED

module.exports.authenticate = () =>{
  // Load client secrets from a local file.
  console.log("auth.authenticate()");
  fs.readFile(config.CLIENT_SECRET, (err, content) => {
    if (err){
      console.log("auth.authenticate: start authorize err");
    //  console.log("ci:", config.oAuthClientID, "-cs:", config.oAuthclientSecret, "-ru:", config.oAuthCallbackUrl);
      var json = JSON.parse(config.client_secret_file);
      //console.log(json);
      authorize(json, setOAuthClient);
      // Authorize a client with credentials, then call the Google Apps Script API.
      console.log("auth.authenticate: end authorize err");
    }else{
      console.log("auth.authenticate:start authorize");
      authorize(JSON.parse(content), setOAuthClient);
      console.log("auth.authenticate:End authorize");
    }

    ;
  });
}


module.exports.getToken = async function(){
  var oauth2Client = module.exports.getOAuthClient();
  //console.log("auth.GetToken:" , oauth2Client.credentials.access_token);
    //console.log("expiring:", oauth2Client.isTokenExpiring());
    var validToken="";
    if(oauth2Client.isTokenExpiring()){
      console.log("Token has expired");
      return new Promise((resolve,reject)=>{
        oauth2Client.getAccessToken((err, token, res)=>{
          //console.log("getAccessToken:", token);
          if (err) return console.error('Error retrieving access token', err);
          if(res){
              module.exports.saveToken( oAuth2Object,res.data);/*
                oauth2Client.setCredentials(res.data);
                  // Store the token to disk for later program executions
                  fs.writeFile(config.TOKEN_PATH, JSON.stringify(res.data), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', config.TOKEN_PATH);
                  });*/
                }

                resolve(token);

              });

      });

    }else{
      return oauth2Client.credentials.access_token;
    }
  }


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
 function authorize(credentials, callback) {
  console.log("auth.authorize");//: Credentials:", credentials);
  //console.log("Credentials", credentials);
  //console.log("Cred.installed", credentials.web);
  const {client_secret, client_id, redirect_uris} = credentials.web; //.installed
  config.oAuthClientID = client_id;
  config.oAuthclientSecret = client_secret;
  config.oAuthCallbackUrl = redirect_uris;

  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  //console.log("Token info:", config.token_info);
  if(typeof config.token_info !=='undefined'){
    oAuth2Client.setCredentials(JSON.parse(config.token_info));
    callback(oAuth2Client);
  }else{
    // Check if we have previously stored a token.
    fs.readFile(config.TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));

      //console.log("refresh?", oAuth2Client.isTokenExpiring());

      callback(oAuth2Client);
    });
  }
}

module.exports.saveToken = (oauth2Client, token) =>{
  console.log("auth.saveToken: Saving token");
  oauth2Client.setCredentials(token);
  setOAuthClient(oauth2Client);
  // Store the token to disk for later program executions
  fs.writeFile(config.TOKEN_PATH, JSON.stringify(token), (err) => {
    console.log("writing file");
    if (err) return console.error(err);
    console.log('Token stored to', config.TOKEN_PATH);
  });

}

function getAccessToken(oAuth2Client, callback) {
  console.log("auth.getAccessToken");
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: config.scopes,
    approval_prompt: 'force',
  });
  console.log('Authorize this app by visiting this url:', authUrl);
}

function setOAuthClient(auth){
  console.log("auth.setOAuthClient");
  oAuth2Object = auth;
}

module.exports.getOAuthClient = () => {
  console.log("auth.getOAuthClient");
    //console.log("is oauth undefined?:", typeof oAuth2Object);
    if(typeof oAuth2Object !=='undefined'){
        //console.log("returning oaut2client");
        return oAuth2Object;  
      }
      else{
        //console.log("creating oaut2");
        return new  google.auth.OAuth2(config.oAuthClientID, config.oAuthclientSecret, config.oAuthCallbackUrl);
      }
    }
