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
var http = require('http');  
var formidable = require('formidable');
var fs = require('graceful-fs');
var path = require('path');
var axios = require('axios');

var client_id = 'e712a437582a476ba9a4f9d109400135'; // Your client id
var client_secret = '753d1881f05a433482369241d7dc87c1'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var access_token, refresh_token;

var profile_info;
var favorite_info;
var artists_info;

var playlist_info;
var trackData = [{},{}];
var deleteData = [{},{}];
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
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


var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

function makeTracks(access_token) {
  		trackID = playlist_info.id;
         trackData[1] = {
        uris: ['spotify:track:4iV5W9uYEdYUVa79Axb7Rh','spotify:track:1301WleyT98MSxVHPZCA6M']
        };
  
         axios({
          method: 'put',
          url: 'https://api.spotify.com/v1/playlists/'+trackID+'/tracks',
          data: trackData[1], 
          dataType: 'json',
          headers: {
          'Authorization': 'Bearer ' + access_token , 
          'Accept': 'application/json'
          }
          }).then(function (response) {
      		  console.log('Track addition success');
          }).catch(function (error) {
            console.log(error);
          });
}

var tracks = [];
function algorithm(A) {
  var temp = [];
  	for(i=0;i<A.length;i++) {
      for(x=i+1;x<A.length;x++) {
        if(A[i] == A[x]) {
           temp.push(A[i]);
           }
      }
    }
  return temp;
}

function retrieveProfileData(access_token, refresh_token, func) {
       var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
       profile_info = body;
        //  console.log(body);
          try{
          func();
          } catch(e) {}
           readPlaylist(access_token, refresh_token, profile_info.id)
        });
}

function retrieveFavoritesData(access_token, refresh_token) {
        var options = {
          url: 'https://api.spotify.com/v1/me/top/tracks',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
         favorite_info = body.items;
        //  		var v = 0;
       //   for(i=0;i<favorite_info.length;i++) {
       //   console.log(favorite_info);
       //     v++;
       //   }
          // favorite_info[].name, .popularity, .uri
        });
  
          options = {
          url: 'https://api.spotify.com/v1/me/top/artists',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
         artists_info = body.items;
         //      		var v = 0;
        //  for(i=0;i<artists_info.length;i++) {
       //  console.log(body.items[v].genres);
        //    v++;
       //   }
        //  console.log(body.items);
          // body.items[], .id, .name, .popularity, .uri, .genres
        }); 
}

function createPlaylist(host_name) {
        let jsonData = {
        name: 'new_playlist',
        public: true,
        description: 'example text'
        };
        
          axios({
          method: 'post',
          url: 'https://api.spotify.com/v1/users/'+host_name+'/playlists',
          data: jsonData, 
          dataType: 'json',
          headers: {
          'Authorization': 'Bearer ' + access_token , 
          'Content-Type': 'application/json'
          }
          }).then(function (response) {
            console.log('done');
          }).catch(function (error) {
            console.log(error);
          });
        
}

function readPlaylist(access_token, refresh_token, host_name, func) {
      var  options = {
          url: 'https://api.spotify.com/v1/users/'+host_name+'/playlists',
          headers: {
          'Authorization': 'Bearer ' + access_token 
          },
          json: true
        };
        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          var v =0;
          var created_list = 'new_playlist';
          for (i=0; i<body.items.length; i++) { 
          if(body.items[v].name == created_list) {
             playlist_info = body.items[v];
         //   console.log(playlist_info);
             } v++;
          }
          try{
          func();
          } catch(e) {}
        //  addTracks(access_token);
         
        });   
}//


var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read playlist-modify-private playlist-modify-public';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
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
      	//console.log(body);
      if (!error && response.statusCode === 200) {

         access_token = body.access_token;
            refresh_token = body.refresh_token;
        
        retrieveProfileData(access_token, refresh_token);
        retrieveFavoritesData(access_token, refresh_token);
               

        // we can also pass the token to the browser to make requests from there
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
      }
    });
  }
});



app.get('/refresh_token', function(req, res) {
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
});



app.get('/main', function(req, res) {
 	res.sendFile(path.join(__dirname+'/public/indexer.html'));
  });

app.get('/host', function(req, res) {
  var host_path = 'embedded_playlist_sub.html';
  var end_path = 'embedded_playlist_subbed.html';
  	fs.readFile(host_path, function(error, content) {
      prepared_link = 'https://open.spotify.com/embed/user/'+profile_info.id+'/playlist/'+playlist_info.id;
      var temp = content.toString();
      console.log(temp);
      var temper = temp.replace('%sub%', prepared_link);
      
          fs.writeFile(end_path, temper, function (err) {
          if (err) throw err;
          console.log('Saved '+end_path);
        });
   						 });
	var filePath = './embedded_playlist_subbed.html';
	//section below prints out page without error//
	fs.readFile(filePath, function(error, content) {
	findTypePage(filePath);
	if(contentType != null)
	{res.writeHead(200, { 'Content-Type': contentType });
	res.end(content, 'utf-8'); } //content //
   						 });
  });


console.log('Listening on 8888 & 3000');
app.listen(8888);
app.listen(3000, '0.0.0.0');
