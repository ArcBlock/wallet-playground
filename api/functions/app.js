/* eslint-disable object-curly-newline */
/* eslint-disable no-console */
require('../libs/contracts/create_movie_ticket_contract/.compiled/create_movie_ticket/javascript/index');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const compression = require('compression');
const ForgeSDK = require('@arcblock/forge-sdk');

// ------------------------------------------------------------------------------
// Routes: due to limitations of netlify functions, we need to import routes here
// ------------------------------------------------------------------------------
const { decode } = require('../libs/jwt');
const { walletHandlers, swapHandlers, agentHandlers, wallet } = require('../libs/auth');

const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.MONGO_URI) {
  throw new Error('Cannot start application without process.env.MONGO_URI');
}

// Connect to database
let isConnectedBefore = false;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, autoReconnect: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.connection.on('disconnected', () => {
  console.log('Lost MongoDB connection...');
  if (!isConnectedBefore) {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, autoReconnect: true });
  }
});
mongoose.connection.on('connected', () => {
  isConnectedBefore = true;
  console.log('Connection established to MongoDB');
});
mongoose.connection.on('reconnected', () => {
  console.log('Reconnected to MongoDB');
});

// Create and config express application
const server = express();
server.use(cookieParser());
server.use(bodyParser.json({ limit: '1 mb' }));
server.use(bodyParser.urlencoded({ extended: true, limit: '1 mb' }));
server.use(cors());

server.use(
  morgan((tokens, req, res) => {
    const log = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
    ].join(' ');

    if (isProduction) {
      // Log only in AWS context to get back function logs
      console.log(log);
    }

    return log;
  })
);

server.use(bearerToken());
server.use((req, res, next) => {
  if (!req.token) {
    next();
    return;
  }

  decode(req.token)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      console.error('session.deserialize.error', err.message);
      next();
    });
});

const router = express.Router();

walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/login')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/payment')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/checkin')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/fund')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/profile')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/error')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer_token_in')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer_token_out')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer_asset_out')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/transfer_asset_in')));
walletHandlers.attach(
  Object.assign({ app: router }, require('../routes/auth/transfer_token_asset_in'))
);
walletHandlers.attach(
  Object.assign({ app: router }, require('../routes/auth/transfer_token_asset_out'))
);
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/consume_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/acquire_asset')));
walletHandlers.attach(Object.assign({ app: router }, require('../routes/auth/exchange')));
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/pickup_swap')));
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_badge')));
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_badges')));
swapHandlers.attach(
  Object.assign({ app: router, signedResponse: true }, require('../routes/auth/swap_token'))
);
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_ticket')));
swapHandlers.attach(Object.assign({ app: router }, require('../routes/auth/swap_certificate')));
agentHandlers.attach(Object.assign({ app: router }, require('../routes/auth/profile'))); // we can reuse something here

require('../routes/session').init(router);
require('../routes/orders').init(router);

// Check for application account
ForgeSDK.getAccountState({ address: wallet.address })
  .then(res => {
    if (!res.state) {
      console.log('\n----------');
      console.error('Application account not declared on chain, abort!');
      console.error('Please run `node tools/declare.js` then start the application again');
      console.log('----------\n');
      process.exit(1);
    } else {
      console.error('Application account declared on chain');
    }
  })
  .catch(err => {
    console.error(err);
    console.log('\n----------');
    console.error('Application account check failed, abort!');
    console.log('----------\n');
    process.exit(1);
  });

// ------------------------------------------------------
// This is required by netlify functions
// ------------------------------------------------------
if (isProduction) {
  if (process.env.NETLIFY && JSON.parse(process.env.NETLIFY)) {
    server.use('/.netlify/functions/app', router);
  } else {
    server.use(compression());
    server.use(router);
    server.use(express.static(path.resolve(__dirname, '../../build'), { maxAge: '365d' }));
    server.get('*', (req, res) => {
      res.send(fs.readFileSync(path.resolve(__dirname, '../../build/index.html')).toString());
    });
  }
  server.use((req, res) => {
    res.status(404).send('404 NOT FOUND');
  });

  // eslint-disable-next-line no-unused-vars
  server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
} else {
  server.use(router);
}

// Make it serverless
exports.handler = serverless(server);
exports.server = server;
