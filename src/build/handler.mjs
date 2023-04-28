import { readFile } from "node:fs";
import express from "express";
import morgan from "morgan";
import { JSONFileSync, LowSync } from "lowdb";
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
app.get("/api/listslice/:start/:count", (req, res, next) => {
  readFile("./database_is_dirty.lock", (err, data) => {
    if (!err) {
      res.send({ status: 305, statusMessage: "Temporary Outage at " + data });
    } else {
      try {
        if (!isDatabaseOpen())
          openDatabase();
        console.log("Starting to fetch coins");
        const coinList = getStoredCoinList(req.params.start, req.params.count);
        res.json(coinList);
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
const getStoredCoinList = (start, count) => {
  if (!databaseIsOpen)
    throw "Database is not open";
  let result = [];
  if (db.data.coins.length > start + count) {
    for (let i = start; i < start + count; i++) {
      result.push({
        id: db.data.coins[i].id,
        name: db.data.coins[i].name,
        score: db.data.coins[i].score,
        price: db.data.coins[i].price,
        last_updated: db.data.coins[i].last_updated
      });
    }
  }
  return result;
};
const handler = app;
export {
  handler
};
