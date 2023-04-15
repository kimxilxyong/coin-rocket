import express from 'express';
import morgan from "morgan";
import { startGeckoBot, getCoinList } from './coinutils';

morgan.token('statusMessage', function (req, res) { return res.statusMessage; });
morgan.token('body', function (req, res) { return res.body; });
morgan.token('errortype', function (req, res) { return res.errorType; });

const app = express();

// only log error responses
//app.use(morgan('[:date[iso]] :remote-addr :remote-user ":method :url HTTP/:http-version" :status :statusMessage :body ":referrer" ":user-agent"',
app.use(morgan('[:date[iso]] :remote-addr ":method :url :body" ":status :errortype :statusMessage" ":user-agent" ":referrer" :response-time ms',
  {
    skip: function (req, res)
    {
      return res.statusCode < 400;
    }
  }));

console.log("api.js - startGeckoBot");
startGeckoBot();

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
app.get("/api/list", (req, res) => {
  console.log(req.params);
  //console.log(req.body);
  //var Coins = [];
  //Coins.push({ id: 1, name: "Bitcoin" });
  //Coins.push({ id: 2, name: "Ethereum" });
  //res.json(Coins);

  const coinList = getCoinList(0, 100);
  res.json(coinList);
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

// Global error handler
app.use((err, req, res, next) => {
  //console.log(err.message);
  //console.log(err);
  res.statusCode = err.status;
  res.statusMessage = err.message;
  res.body = err.body;
  res.errorType = err.type;
  next(err, req, res, next);
});

export const handler = app;
