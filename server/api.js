import { readFile } from 'node:fs';
import express from 'express';
import morgan from "morgan";
import { isDatabaseOpen, openDatabase, closeDatabase, getStoredCoinList } from "./datastore.js";

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

app.get("/api/listslice/:start/:count", (req, res, next) => {
  readFile('./database_is_dirty.lock', (err, data) => {
    if (!err) {
      res.send({ status: 305, statusMessage: "Temporary Outage at " + data });
    } else {

      try {
        console.log("Starting to fetch coins");
        const coinList = getStoredCoinList(req.params.start, req.params.count);
        res.json(coinList);
      } catch (error) {
        //next({status: 305, statusMessage: error});
        //console.log(error);
        next(error);
      }

    }
  });
});

/*app.get('/api/listslice/:start/:count', [
  async (req, res, next) => {
    const contents = await readFile("./database_is_dirty.lock", { encoding: 'utf8' }).catch((err) => {
      console.log(err);
      //next("route");
    });
    if (contents) {
      res.send({ status: 305, statusMessage: "Temporary Outage at " + contents });
    } else {
      next("route");
    }
  },
  (req, res, next) => {
    try {
      console.log("Starting to fetch coins");
      const coinList = getStoredCoinList(req.params.start, req.params.count);
      res.json(coinList);
    } catch (err) {
      next(err);
    }
  }
]);
*/

// Receive a current top list
app.post("/api/storenewdailylist", (req, res) => {
  //console.log(req);
  //console.log(req.body);
  //console.log(req.params);
  var Coins = [];
  Coins.push({ id: 2, name: "Ether" });
  res.json(Coins);
});

/*
// Global error handler
app.use((err, req, res, next) => {
  //console.log(err.message);
  console.log(err);
  res.statusCode = err.status;
  res.statusMessage = err.message;
  res.body = err.body;
  res.errorType = err.type;
  console.log(res.statusCode);
  console.log(res.statusMessage);
  next(err, req, res, next);
});
*/


app.use((err, req, res, next) => {
  console.error(err);
  //res.status(305).send(err);
  next(err, req, res, next);
});


export const handler = app;
