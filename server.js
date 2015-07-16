// server.js

// require express framework and additional modules
var express = require('express'),
  app = express(),
  ejs = require('ejs'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  User = require('./models/user'),
  session = require('express-session');

// connect to mongodb
mongoose.connect('mongodb://localhost/test');

// set view engine for server-side templating
app.set('view engine', 'ejs');

// middleware
app.use(bodyParser.urlencoded({extended: true}));
//middleware that manages the session

app.use('/', function (req, res, next) {
	//saves the user in session
	req.login = function (user) {
		req.session.userID = user.id;
	};
	//finds user currently logged in based on session.userId
	req.currentUser = function (callback) {
		User.findOne({_id: req.session.userId}, function (err, user) {
			req.user = user;
			callback(null,user);
		});
	};
	//destroy session.userID to log out your user
	req.logout = function () {
		req.session.userId = null;
		req.user = null;
	};
	next();
});

//set session options
app.use(session({
	saveUninitialized: true,
	resave: true,
	secret: 'SuperSecretCookie',
	cookie: {maxAge: 600}
}));

//user profile page
app.get('/profile', function (req, res) {
	//find user currently logged in
	req.currentUser(function (err, user) {
		res.send('Welsome ' + user.email);
	});
});

// signup route with placeholder response
app.get('/signup', function (req, res) {
  res.send('coming soon');
});

// user submits the signup form
app.post('/users', function (req, res) {

  // grab user data from params (req.body)
  var newUser = req.body.user;

  // create new user with secure password
  User.createSecure(newUser.email, newUser.password, function (err, user) {
    res.send(user);
  });
});
//user login 
app.post('/login', function (req, res){
	//grab user data from params
	var userData = req.body.user;
	//call authenticate to check password
	User.authenticate(userData.email, userData.password, function (err, user) {
		res.send(user);
	})
})

// listen on port 3000
app.listen(3000, function () {
  console.log('server started on locahost:3000');
});