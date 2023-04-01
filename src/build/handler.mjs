import express from "express";
import morgan from "morgan";
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
app.get("/api/list", (req, res) => {
  var Coins = [];
  Coins.push({ id: 1, name: "Bitcoin" });
  Coins.push({ id: 2, name: "Ethereum" });
  res.json(Coins);
});
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
