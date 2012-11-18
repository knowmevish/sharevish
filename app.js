
/**
 * Module dependencies.
 */

var express = require('express')
  , Sequelize = require("sequelize")
  //, routes = require('./routes')
  , passport = require('passport')
  , util = require('util')
  , TwitterStrategy = require('passport-twitter').Strategy
  //, user = require('./routes/user')
  , http = require('http')
  , path = require('path');


var sequelize = new Sequelize('vshare_dev','root','root',{});
var User = sequelize.define('User', {
  screen_id: Sequelize.STRING,
  name: Sequelize.STRING,
  partner: Sequelize.BOOLEAN
})

User.sync();

passport.use(new TwitterStrategy({
    consumerKey: 'BkumPGMw12LGt7WfAqA',
    consumerSecret: 'velwQ1Z34wssaKT4ke9WN5HoBlKd5kblRC7cJE8',
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log(profile.username);
    User.find({ where: {screen_id: profile.id} }).success(function(user) {
    //User.findOne({screen_id: profile.screen_id}, function(err, user) {
      if(user) {
        done(null, user);
      } else {

        User.create({ screen_id: profile.id, name: profile.username, partner:false }).success(function(user) {
          // you can now access the newly created task via the variable task
          user.save().success(function(err) {
            //if(err) { throw err; }
            done(null, user);
          });
        });
        //var user = new User();
        //user.provider = "twitter";
        //user.screen_id = profile.screen_id;
        //user.name = profile.name;
        //user.image = profile._json.profile_image_url;
        // user.save(function(err) {
        //   if(err) { throw err; }
        //   done(null, user);
        // });

       
      }
    })
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.screen_id);
});

passport.deserializeUser(function(uid, done) {
  User.find({ where: {screen_id: uid} }).success(function(user) {
    done(null,user);
  });
  // User.findOne({uid: uid}, function (err, user) {
  //   done(err, user);
  // });
});

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// app.get('/', routes.index);
// app.get('/login', routes.login);
// app.get('/auth/twitter', routes.auth.twitter);
// app.get('/auth/twitter/callback', routes.auth.twitter.callback);
// //app.post('/post', routes.post);
// app.get('/logout', routes.logout);
// app.get('/users', user.list);

app.get('/', function(req, res){
  console.log("got the route");
  res.render('index', { user: req.user});
});

app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/touch', function(req,res){
  console.log(req.session.passport.user);
  //res.ridirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});




/** 
* quit gracefully
*/

process.on( 'SIGINT', function() {
  console.log( "\ngracefully shutting down from  SIGINT (Crtl-C)" )
  // some other closing procedures go here
  process.exit( )
})