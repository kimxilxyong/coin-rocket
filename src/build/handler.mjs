import { readFile } from "node:fs";
import express from "express";
import morgan from "morgan";
import { JSONFileSync, LowSync } from "lowdb";
const BASE = "https://api.coingecko.com/api/";
const HOST = "api.coingecko.com";
const API_VERSION = "3";
const URI = `${BASE}v${API_VERSION}`;
const REQUESTS_PER_SECOND = 10;
const TIMEOUT = 3e4;
const ORDER = {
  GECKO_ASC: "gecko_asc",
  GECKO_DESC: "gecko_desc",
  MARKET_CAP_ASC: "market_cap_asc",
  MARKET_CAP_DESC: "market_cap_desc",
  VOLUME_ASC: "volume_asc",
  VOLUME_DESC: "volume_desc",
  COIN_NAME_ASC: "coin_name_asc",
  COIN_NAME_DESC: "coin_name_desc",
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  HOUR_24_ASC: "h24_change_asc",
  HOUR_24_DESC: "h24_change_desc",
  TRUST_SCORE_DESC: "trust_score_desc",
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
  OPEN_INTEREST_BTC_ASC: "open_interest_btc_asc",
  OPEN_INTEREST_BTC_DESC: "open_interest_btc_desc",
  TRADE_VOLUME_24H_BTC_ASC: "trade_volume_24h_btc_asc",
  TRADE_VOLUME_24H_BTC_DESC: "trade_volume_24h_btc_desc"
};
const STATUS_UPDATE_CATEGORY = {
  GENERAL: "general",
  MILESTONE: "milestone",
  PARTNERSHIP: "partnership",
  EXCHANGE_LISTING: "exchange_listing",
  SOFTWARE_RELEASE: "software_release",
  FUND_MOVEMENT: "fund_movement",
  NEW_LISTINGS: "new_listings",
  EVENT: "event"
};
const STATUS_UPDATE_PROJECT_TYPE = {
  COIN: "coin",
  MARKET: "market"
};
const EVENT_TYPE = {
  EVENT: "Event",
  CONFERENCE: "Conference",
  MEETUP: "Meetup"
};
const TIMEFRAME = {
  DAILY: "daily",
  WEEKLY: "weekly",
  BIWEEKLY: "biweekly",
  MONTHLY: "monthly",
  F200DAY: "F200day",
  YEARLY: "yearly,"
};
const Constants = {
  HOST,
  BASE,
  API_VERSION,
  URI,
  REQUESTS_PER_SECOND,
  TIMEOUT,
  ORDER,
  STATUS_UPDATE_CATEGORY,
  STATUS_UPDATE_PROJECT_TYPE,
  EVENT_TYPE,
  TIMEFRAME
};
morgan.token("statusMessage", function(req, res) {
  return res.statusMessage;
});
morgan.token("body", function(req, res) {
  return res.body;
});
morgan.token("errortype", function(req, res) {
  return res.errorType;
});
const app = express();
app.use(morgan(
  '[:date[iso]] :remote-addr ":method :url :body" ":status :errortype :statusMessage" ":user-agent" ":referrer" :response-time ms',
  {
    skip: function(req, res) {
      return res.statusCode < 400;
    }
  }
));
app.use(express.json());
app.get("/api/list", [
  function(req, res, next) {
    readFile("/maybe-valid-file", "utf-8", (err, data) => {
      res.locals.data = data;
      next(err);
    });
  },
  function(req, res) {
    res.locals.data = res.locals.data.split(",")[1];
    res.send(res.locals.data);
  }
]);
app.get("/api/listslice/:requestCount/:start/:count/:timeframe/", (req, res, next) => {
  readFile("./database_is_dirty.lock", (err, data) => {
    if (!err) {
      res.send({ status: 305, statusMessage: "Temporary Outage at " + data });
    } else {
      try {
        if (!isDatabaseOpen())
          openDatabase();
        console.log("Starting to fetch coins");
        console.log(req._remoteAddress);
        console.log(req.socket._peername);
        console.log(req.url);
        const coinList = getStoredCoinList(req.params.requestCount, req.params.start, req.params.count, req.params.timeframe);
        res.json({ status: 200, coins: coinList });
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  });
});
app.post("/api/storenewdailylist", (req, res) => {
  var Coins = [];
  Coins.push({ id: 2, name: "Ether" });
  res.json(Coins);
});
app.use((err, req, res, next) => {
  console.error(err);
  next(err, req, res, next);
});
const adapter = new JSONFileSync("./dbfile.sorted.json");
const db = new LowSync(adapter);
let databaseIsOpen = false;
const isDatabaseOpen = () => {
  return databaseIsOpen;
};
const openDatabase = () => {
  if (databaseIsOpen) {
    throw "Database is already open";
  }
  db.read();
  db.data = db.data || { coins: [] };
  databaseIsOpen = true;
  return true;
};
const getStoredCoinList = (requestCount, start, count, timeframe) => {
  if (!databaseIsOpen)
    throw "Database is not open";
  let result = [];
  if (db.data.coins.length <= start + count) {
    count = db.data.coins.length - start - 1;
  }
  db.data.coins.slice(start, start + count).forEach((coin) => {
    result.push({
      id: coin.id,
      name: coin.name,
      score: coin.score,
      price: coin.price,
      image: coin.image,
      last_updated: coin.last_updated,
      current_price: coin.history[coin.history.length - 1].current_price,
      price_change_percentage_24h_in_currency: coin.history[coin.history.length - 1].price_change_percentage_24h_in_currency,
      price_change_percentage_7d_in_currency: coin.history[coin.history.length - 1].price_change_percentage_7d_in_currency,
      price_change_percentage_14d_in_currency: coin.history[coin.history.length - 1].price_change_percentage_14d_in_currency,
      price_change_percentage_30d_in_currency: coin.history[coin.history.length - 1].price_change_percentage_30d_in_currency,
      price_change_percentage_200d_in_currency: coin.history[coin.history.length - 1].price_change_percentage_200d_in_currency,
      price_change_percentage_1y_in_currency: coin.history[coin.history.length - 1].price_change_percentage_1y_in_currency
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
const handler = app;
export {
  handler
};
