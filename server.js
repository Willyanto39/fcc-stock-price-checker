'use strict';
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const mongoose    = require('mongoose');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log('Connected to database');
  }
});

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"],
    scriptSrc: ["'self'"]
  }
}));

//Index page (static HTML)
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);

// Middleware to convert req.query.like to boolean
app.use('/api/stock-prices', (req, res, next) => {
  const { like } = req.query;

  if (!like) {
    req.query.like = false;
    return next();
  }

  const lowerCaseLike = like.toLowerCase();

  if (lowerCaseLike !== 'true' && lowerCaseLike !== 'false') {
    throw new Error('like must be either true or false');
  }

  if (lowerCaseLike == 'true') {
    req.query.like = true;
  } else {
    req.query.like = false;
  }

  next();
});

//404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const port = process.env.PORT || 3000

//Start our server and tests!
app.listen(port, () => {
  console.log("Listening on port " + port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
