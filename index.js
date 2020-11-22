const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cors = require('cors');
const express = require('express');
const app = express();

const refreshTokens = {};
const recentTrancArray ={};
const SECRET = 'VERY_SECRET_KEY!';
const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

passport.use(new JwtStrategy(passportOpts, function (jwtPayload, done) {
  const expirationDate = new Date(jwtPayload.exp * 1000);
  if(expirationDate < new Date()) {
    return done(null, false);
  }
  done(null, jwtPayload);
}))

passport.serializeUser(function (user, done) {
  done(null, user.username)
});

app.post('/login', function (req, res) { 
    const {username, password} = req.body;
    const user = { 
        'username': username, 
        'role': 'admin'
    };
    const token = jwt.sign(user, SECRET, { expiresIn: 600 }) 
    const refreshToken = randtoken.uid(256);
    refreshTokens[refreshToken] = username;
    res.json({jwt: token, refreshToken: refreshToken,username:username});
});

app.post('/logout', function (req, res) { 
  const refreshToken = req.body.refreshToken;
  if (refreshToken in refreshTokens) { 
    delete refreshTokens[refreshToken];
  } 
  res.sendStatus(204); 
});

app.post('/refresh', function (req, res) {
    const refreshToken = req.body.refreshToken;
    

    if (refreshToken in refreshTokens) {
      const user = {
        'username': refreshTokens[refreshToken],
        'role': 'admin'
      }
      const token = jwt.sign(user, SECRET, { expiresIn: 600 });
      res.json({jwt: token})
    }
    else {
      res.sendStatus(401);
    }
});

app.get('/random', passport.authenticate('jwt'), function (req, res) {
  res.json({value: Math.floor(Math.random()*100) });
});

/*******user profile */

app.post('/userProfile', function (req, res) { 
  const {username} = req.body;
  const user = { 
      'username': username, 
      'role': 'admin'
  };
  
  res.json({
    name:username,
    emailId:`${username}${'@gmail.com'}`,
    address:`${'Ashok Apartment,Navi Mumbai'}`,
    contact:`${'7865432156'}`,
    Gender:`${'Female'}`
  });
});

app.post('/recentTransc', function (req, res) { 
  const username = req.body.username;
  const recentTransactions=  req.body.Recenttransaction;
  // console.log(req.body);
  // console.log(recentTransactions);
  const user = { 
      'username': username, 
      'role': 'admin'
  };
  recentTrancArray.username = username;
  recentTrancArray.recentTransactions = req.body.Recenttransaction;
  console.log(recentTrancArray);
  res.json({
    name:username,
    recentFlag:true,
  });
});
app.get('/recent', function (req, res) {
  const username = req.query.username;
  // console.log(req.query);
  console.log(recentTrancArray);
   if (recentTrancArray.username.username  ==  username) { 
    res.json({
      name:username,
      recentTransactions:recentTrancArray.recentTransactions
     });
  } 
});

app.listen(8080);