import { readFile } from 'node:fs';
import express from 'express';
import morgan from "morgan";
import { LowSync, JSONFileSync } from 'lowdb';
//const Constants = require('./helpers/constants');
import Constants from "./../../server/coingecko-api-fetch/lib/helpers/constants.js";


morgan.token('statusMessage', function (req, res) { return res.statusMessage; });
morgan.token('body', function (req, res) { return res.body; });
morgan.token('errortype', function (req, res) { return res.errorType; });

const app = express();

// only log error responses
//app.use(morgan('[:date[iso]] :remote-addr :remote-user ":method :url HTTP/:http-version" :status :statusMessage :body ":referrer" ":user-agent"',
app.use(morgan('[:date[iso]] :remote-addr ":method :url :body" ":status :errortype :statusMessage" ":user-agent" ":referrer" :response-time ms',
  {
    skip: function (req, res) {
      return res.statusCode < 400;
    }
  }));


/*app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',

    console.log(res),
    //tokens['response-time'](req, res), 'ms'
  ].join(' ');
}));
*/

// Parse request title/body as JSON
app.use(express.json());

// Return whole historical top list
app.get("/api/list", [
  function (req, res, next) {
    readFile('/maybe-valid-file', 'utf-8', (err, data) => {
      res.locals.data = data;
      next(err);
    });
  },
  function (req, res) {
  res.locals.data = res.locals.data.split(',')[1];
    res.send(res.locals.data);
  }
]);

app.get("/api/listslice/:requestCount/:start/:count/:timeframe/", (req, res, next) => {
  readFile('./database_is_dirty.lock', (err, data) => {
    if (!err) {
      res.send({ status: 305, statusMessage: "Temporary Outage at " + data });
    } else {

      try {
        if (!isDatabaseOpen()) openDatabase();
        console.log("Starting to fetch coins"); console.log(req._remoteAddress); console.log(req.socket._peername); console.log(req.url);
        const coinList = getStoredCoinList(req.params.requestCount, req.params.start, req.params.count, req.params.timeframe);
        res.json({ status: 200, coins: coinList });
      } catch (error) {
        //next({status: 305, statusMessage: error});
        console.log(error);
        next(error);
      }

    }
  });
});


// Receive a current top list
app.post("/api/storenewdailylist", (req, res) => {
  //console.log(req);
  //console.log(req.body);
  //console.log(req.params);
  var Coins = [];
  Coins.push({ id: 2, name: "Ether" });
  res.json(Coins);
});

app.use((err, req, res, next) => {
  console.error(err);
  //res.status(305).send(err);
  next(err, req, res, next);
});


const adapter = new JSONFileSync('./dbfile.sorted.json');
const db = new LowSync(adapter);

let databaseIsOpen = false;

const isDatabaseOpen = () => {
  return databaseIsOpen;
};

const openDatabase = () => {
  if (databaseIsOpen) {
    throw('Database is already open');
  }
  db.read();  //Load the content of the file into memory
  db.data = db.data || { coins: [] }; //default value
  databaseIsOpen = true;
  return true;
};

const closeDatabase = () => {
  if (!databaseIsOpen) throw('Database is not open');

  db.data = { coins: [] }; // Reset to default value
  databaseIsOpen = false;
};

const getStoredCoinList = (requestCount, start, count, timeframe) => {
  if (!databaseIsOpen) throw ('Database is not open');
  let result = [];

  if (db.data.coins.length <= start + count) {
    count = db.data.coins.length - start - 1;
  }

  db.data.coins.slice(start, start+count).forEach(coin => {
    result.push({
      id: coin.id,
      name: coin.name,
      score: coin.score,
      price: coin.price,
      image: coin.image,
      last_updated: coin.last_updated,
      current_price: coin.history[coin.history.length-1].current_price,
      price_change_percentage_24h_in_currency: coin.history[coin.history.length - 1].price_change_percentage_24h_in_currency,
      price_change_percentage_7d_in_currency: coin.history[coin.history.length - 1].price_change_percentage_7d_in_currency,
      price_change_percentage_14d_in_currency: coin.history[coin.history.length - 1].price_change_percentage_14d_in_currency,
      price_change_percentage_30d_in_currency: coin.history[coin.history.length - 1].price_change_percentage_30d_in_currency,
      price_change_percentage_200d_in_currency: coin.history[coin.history.length - 1].price_change_percentage_200d_in_currency,
      price_change_percentage_1y_in_currency: coin.history[coin.history.length - 1].price_change_percentage_1y_in_currency,
    });
  });

  result.sort((a, b) => {
    switch (timeframe) {
      case Constants.TIMEFRAME.DAILY:
        return b.price_change_percentage_24h_in_currency - a.price_change_percentage_24h_in_currency;
      case Constants.TIMEFRAME.WEEKLY:
        return b.price_change_percentage_7d_in_currency - a.price_change_percentage_7d_in_currency;
      case Constants.TIMEFRAME.BIWEEKLY:
        return b.price_change_percentage_14d_in_currency - a.price_change_percentage_14d_in_currency;
      case Constants.TIMEFRAME.MONTHLY:
        return b.price_change_percentage_30d_in_currency - a.price_change_percentage_30d_in_currency;
      case Constants.TIMEFRAME.F200DAY:
        return b.price_change_percentage_200d_in_currency - a.price_change_percentage_200d_in_currency;
      case Constants.TIMEFRAME.YEARLY:
        return b.price_change_percentage_1y_in_currency - a.price_change_percentage_1y_in_currency;
      default:
        return 0;
    }
  });

  return result.slice(0, requestCount);
};

export const handler = app;
