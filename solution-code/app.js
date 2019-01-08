const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const app = express();
const hbs = require('hbs');
require("dotenv").config();

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static('public')); // Don' forget this line if you want to able to use you css files

//You don't want to expose your api credentials to everyone that has access to you git repository.
//The best practice is to store them as environment variables.
var clientId = process.env.clientId, //Environment variables can be retrieved from process.env.VARIABLE_NAME
  clientSecret = process.env.clientSecret;

var spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret
});

spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  });

app.get('/', (req, res, next) => { //The route for the root of the website
  res.render('home');
});

app.get('/artists', (req, res, next) => { //The route for the /artits?artist=searched_name url
  spotifyApi.searchArtists(req.query.artist) //We can retrieve the artist parameter from req.query because the form uses the GET method
    .then(data => {
      res.render('artists', {
        artists: data.body.artists.items
      }); //The second parameter of res.render is the data that can be used in the .hbs view
    })
    .catch(err => {
      console.log('Something went wrong!', err);
    })
});

app.get('/albums/:artistId', (req, res, next) => { //The route for the /albums/ARTIST_ID url
  spotifyApi.getArtistAlbums(req.params.artistId)
    .then(data => {
      res.render('albums', {
        albums: data.body.items
      });
    })
    .catch(err => {
      console.log('Something went wrong!', err);
    });
});

app.get('/tracks/:albumId', (req, res, next) => {
  spotifyApi.getAlbumTracks(req.params.albumId)
    .then(data => {
      res.render('tracks', {
        tracks: data.body.items
      });
    })
    .catch(err => {
      console.log('Something went wrong!', err);
    });
});

// catch 404 and forward to error handler
app.use((req, res, next) => { //Code to execute if no matching route was found above
  var err = new Error('Not Found');
  err.status = 404;
  next(err); //You can use next to execute the next handler that matches the request, in this case it's the error handler
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
