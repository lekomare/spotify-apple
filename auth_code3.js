/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'e712a437582a476ba9a4f9d109400135'; // Your client id
var client_secret = '753d1881f05a433482369241d7dc87c1'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var http = require('http');  
var formidable = require('formidable');
var fs = require('graceful-fs');
var path = require('path');

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

/*app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
   */

function findTypePage(filePath) { 
    	var extname = path.extname(filePath);
    	contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    		} console.log("Using Content for: " + filePath + ", Type: " + contentType);
}


function login(req, res) {
 var state = generateRandomString(16);
  	console.log(state);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  	console.log("login function triggered");
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
  console.log("login function passed");
  	callback(req, res);
}


function callback(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  console.log("callback function triggered");
  if (state === null || state !== storedState) {
  //  res.redirect('/#' +
  //    querystring.stringify({
  //      error: 'state_mismatch'
  //    }));
    
  console.log("callback function failed");
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        
        var options = {
          url: 'https://api.spotify.com/v1/me/top/artists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          var v = 0;
          for(i=1;i<=20;i++) {
          console.log(body.items[v].name);
            v++;
          }
        });
	refresh_token(req, res);
        // we can also pass the token to the browser to make requests from there
      /*  
      res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
          */
      }
    });
  }
}

function refresh_token(req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
}


function maintainServer(req, res) { 
	var filePath = '.' + req.url; 
 if (req.url == '/') { 
	filePath = './login_direct.html';
	if(req.method == "POST") 
	{
	} 
 }
 else if (req.url == '/login') { 
	//filePath = './host_view.html';
	if(req.method == "POST") 
	{
      console.log("posted");
      login(req, res);
	} 
 }
 else if (req.url == '/callback') { 
	//filePath = './group_view.html';
	if(req.method == "POST") 
	{
	} 
 }
else {

}
	//section below prints out page without error//
	fs.readFile(filePath, function(error, content) {
	findTypePage(filePath);
	if(contentType != null)
	{res.writeHead(200, { 'Content-Type': contentType });
	res.end(content, 'utf-8'); } //content //
   						 });
}


http.createServer(function(req, res) { 
maintainServer(req, res);
}).listen(8888);
console.log('Listening on 8888');
