var SECRET = {
  CONSUMER_KEY: 'BkumPGMw12LGt7WfAqA',
  CONSUMER_SECRET: 'velwQ1Z34wssaKT4ke9WN5HoBlKd5kblRC7cJE8',
};


//var models = require('./models');

var OAuth  = require('oauth').OAuth;
var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token", 
    SECRET.CONSUMER_KEY,
    SECRET.CONSUMER_SECRET,
    "1.0",
    "http://127.0.0.1:3000/auth/twitter/callback",
    "HMAC-SHA1");
/*
 * GET home page.
 */

exports.login = function (req, res) {
  //console.log("req",req);
  if(req.session.oauth && req.session.oauth.access_token) {
    //console.log("req",req);
    // res.render('index', {
    //   screen_name: req.session.twitter.screen_name
    // });
  } else {
    res.render('login');
  }
};

exports.auth = {};
exports.auth.twitter = function(req, res){

  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if (error) {
      console.log("err",error);
      res.send("yeah no. didn't work.")
    } else {
      req.session.oauth = {};
      req.session.oauth.token = oauth_token;
      req.session.oauth.token_secret = oauth_token_secret;
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
    }
  });
};

exports.auth.twitter.callback = function(req, res, next){
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth = req.session.oauth;
    oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier, 
        function(error, oauth_access_token, oauth_access_token_secret, results){
          if (error){
            console.log("auth");
            res.send("yeah something broke.",error);
          } else {
            req.session.oauth.access_token = oauth_access_token;
            req.session.oauth.access_token_secret = oauth_access_token_secret;
            req.session.twitter = results;
            res.redirect("/");
          }
        }
    );
  } else
    next(new Error("you're not supposed to be here."));
};

exports.index = function (req, res) {
  if(req.session.oauth && req.session.oauth.access_token) {
    console.log("res",req.session.twitter);
    res.render('index', {
      screen_name: req.session.twitter.screen_name
    });
  } else {
    res.redirect("/login");
  }
};

// exports.post = function (req, res) {
//   if(req.session.oauth && req.session.oauth.access_token) {
//     var text = req.body.text;
//     oa.post(
//       'https://api.twitter.com/1/statuses/update.json',
//       req.session.oauth.access_token, 
//       req.session.oauth.access_token_secret,
//       {"status": text},
//       function (err, data, response) {
//         if (err) {
//           res.send('too bad.' + JSON.stringify(err));
//         } else {
//           res.send('posted successfully...!');
//         }
//       });
//   } else {
//     res.send('fail.');
//   }
// };

exports.logout = function (req, res) {
  req.session.destroy();
  res.render('logout');
};

