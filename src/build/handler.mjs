import { readFile } from "node:fs/promises";
import express from "express";
import morgan from "morgan";
import { JSONFileSync, LowSync } from "lowdb";
const adapter = new JSONFileSync("dbfile.json");
new LowSync(adapter);
const getStoredCoinList = (start, count) => {
  throw "Database is not open";
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
    fs.readFile("/maybe-valid-file", "utf-8", (err, data) => {
      res.locals.data = data;
      next(err);
    });
  },
  function(req, res) {
    res.locals.data = res.locals.data.split(",")[1];
    res.send(res.locals.data);
  }
]);
app.get("/api/listslice/:start/:count", [
  async (req, res, next) => {
    const contents = await readFile("./database_is_dirty.lock", { encoding: "utf8" }).catch((err) => {
      console.log(err);
      next("route");
    });
    res.send({ status: 305, statusMessage: "Temporary Outage at " + contents });
  },
  async (req, res, next) => {
    try {
      const coinList = getStoredCoinList(req.params.start, req.params.count);
      res.json(coinList);
    } catch (err) {
      next(err);
    }
  }
]);
app.post("/api/storenewdailylist", (req, res) => {
  var Coins = [];
  Coins.push({ id: 2, name: "Ether" });
  res.json(Coins);
});
app.use((err, req, res, next) => {
  res.statusCode = err.status;
  res.statusMessage = err.message;
  res.body = err.body;
  res.errorType = err.type;
  next(err, req, res, next);
});
const handler = app;
export {
  handler
};
