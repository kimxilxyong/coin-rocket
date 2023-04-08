//1. Import coingecko-api
import CoinGecko from "./coingecko-api-fetch/index.js";
//const CoinGecko = require('./coingecko-api-fetch');

import { isDatabaseOpen, openDatabase, closeDatabase, sortDatabase, getAllCoins, getCoin, flush, addCoin } from "./datastore.js";
//const AddCoin = require("./datastore.js");


//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

let page = 0;

// Load details about the coins
// page is the page number, one page has 100 entries, ordered by marketcap
const fetchCoinTopListAsync = async (page) => {
  let params = {
    page: page,
    per_page: 100,
    order: CoinGecko.ORDER.MARKET_CAP_DESC,
    price_change_percentage: "24h,7d,14d,30d,200d,1y"
    //price_change_percentage: "1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y"
  };

  let data = await CoinGeckoClient.coins.markets(params).catch((err) => { console.log("fetchCoinTopListAsync CATCH: " + err); throw (err); });
  return (data);
};

//fetchCoinTopListAsync(10).catch((e) => { console.error(e); }).then((coins) => {
const getCurrentCoinTopList = async (page, days) => {
  var i = 0;
  var result = {
    code: 0,
    coinsTopList: []
  };
  try {
    let coins = await fetchCoinTopListAsync(page).catch((e) => { e.step = "fetchCoinTopListAsync"; throw (e); });

    //console.log(coins);

    result.code = coins.code;
    if (coins.code == 200) {
      coins.data.forEach((coin) => {

        if ((coin.market_cap_rank && coin.total_volume && coin.circulating_supply) &&
            coin.price_change_percentage_24h_in_currency > 0.0 &&
            coin.price_change_percentage_7d_in_currency > 0.0 &&
            coin.price_change_percentage_14d_in_currency > 0.0 &&
           (coin.price_change_percentage_30d_in_currency > 0.0 || days < 30)
        ) {
          //console.log('***************************************');
          //console.log(coin);
          //coin.score = 0;
          result.coinsTopList.push(coin);
          i++;
        }

      });
      //console.log(i, "coins fetched from coingecko");

      // Sort the coins list by percentage increase over the last 14 or 30 days
      result.coinsTopList.sort((coinA, coinB) => {
        const percentsA = coinA.price_change_percentage_24h_in_currency + coinA.price_change_percentage_7d_in_currency + coinA.price_change_percentage_14d_in_currency + (days >= 30 ? coinA.price_change_percentage_30d_in_currency : 0);
        const percentsB = coinB.price_change_percentage_24h_in_currency + coinB.price_change_percentage_7d_in_currency + coinB.price_change_percentage_14d_in_currency + (days >= 30 ? coinB.price_change_percentage_30d_in_currency : 0);
        coinA.score = 1 + parseInt(percentsA * (1 / ( coinA.circulating_supply / coinA.total_volume )));
        coinB.score = 1 + parseInt(percentsB * (1 / ( coinB.circulating_supply / coinB.total_volume )));
        //console.log(coinA.score, percentsA, coinA.total_volume, coinA.current_price);
        return percentsB - percentsA;
      });
    }

    return result;
  }
  catch (e) {
    //console.log("getCurrentCoinTopList CATCH:", e);
    //console.log("e.code", e.code);
    //console.log("e.message", e.message);
    //console.log("e.reason", e.reason);
    throw(e);
  }
};


function fetchGecko() {
  getCurrentCoinTopList(page, 30).catch((err) => {
    console.log("Error while fetching page", page);
    console.log(err);
    setTimeout(fetchGecko, 1000 * 60 * 20);
  }).then((results) => {
    if (!results) return;
    if (results.code == 200) {
      if (!isDatabaseOpen()) openDatabase();
      let i = 0;
      results.coinsTopList.forEach((coin) => {

        if (addCoin(coin)) {
          console.log("[", getCurrentDateTime(), "]", coin.name, coin.score);
          //console.log(coin);
          i++;
        }
        //console.log(coin);
      });
      console.log("[", getCurrentDateTime(), "] Page:", page, ", ", results.coinsTopList.length, "Coins fetched, ", i, " added to database");

      if (results.coinsTopList.length == 0) {
        page = 1;
        sortDatabase();
        setTimeout(fetchGecko, 1000 * 60 * 120);
      } else {
        page++;
        setTimeout(fetchGecko, 1000 * 60);
      }

      closeDatabase();

    } else {
      page = 1;
      setTimeout(fetchGecko, 1000 * 60 * 120);
    }
  });

}

function getCurrentDateTime() {
  let date = new Date();
  let hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  let min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  let sec = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  let day = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}


page = 1;
setTimeout(fetchGecko, 1000);

//export { getCurrentCoinTopList, fetchCoinTopListAsync};
