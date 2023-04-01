//1. Import coingecko-api
//import CoinGecko from "coingecko-api";
const CoinGecko = require('coingecko-api');

//import { AddCoin } from "./datastore.js";
//const AddCoin = require("./db/datastore.js");


//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

// Load details about the coins
// page is the page number, one page has 100 entries, ordered by marketcap
const fetchCoinTopListAsync = async (page) => {
  let params = {
    page: page,
    per_page: 100,
    order: CoinGecko.ORDER.MARKET_CAP_DESC,
    price_change_percentage: "24h,7d,14d,30d",
    locale: "en",
    sparkline: false,
    //price_change_percentage: "1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y"
  };

  let data = await CoinGeckoClient.coins.markets(params).catch((err) => { console.log("XXXXXXXXXXXXXXXXXXXXXXXXX" + err); throw (err); });
  return (data);
};

//fetchCoinTopListAsync(10).catch((e) => { console.error(e); }).then((coins) => {
const getCurrentCoinTopList = async (days) => {
  var i = 0;
  var page = 10;
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

        if (coin.price_change_percentage_24h_in_currency > 0.0 &&
            coin.price_change_percentage_7d_in_currency > 0.0 &&
            coin.price_change_percentage_14d_in_currency > 0.0 &&
           (coin.price_change_percentage_30d_in_currency > 0.0 || days < 30)
        ) {
          //console.log('***************************************');
          //console.log(coin);
          coin.score = 0;
          result.coinsTopList.push(coin);
          i++;
        }

      });
      console.log(i, "coins");

      // Sort the coins list by percentage increase over the last 14 or 30 days
      result.coinsTopList.sort((coinA, coinB) => {
        const percentsA = coinA.price_change_percentage_24h_in_currency + coinA.price_change_percentage_7d_in_currency + coinA.price_change_percentage_14d_in_currency + (days >= 30 ? coinA.price_change_percentage_30d_in_currency : 0);
        const percentsB = coinB.price_change_percentage_24h_in_currency + coinB.price_change_percentage_7d_in_currency + coinB.price_change_percentage_14d_in_currency + (days >= 30 ? coinB.price_change_percentage_30d_in_currency : 0);
        coinA.score = parseInt(percentsA);
        coinB.score = parseInt(percentsB);
        return percentsB - percentsA;
      });
    }

    return result;
  }
  catch (e) {
    console.log("getCurrentCoinTopList CATCH:", e);
    console.log("e.code", e.code);
    console.log("e.message", e.message);
    console.log("e.reason", e.reason);
    e.step = fetchStep;
    throw(e);
  }
};


getCurrentCoinTopList(30).catch(err => console.log(err)).then((results) => {
//  if (results.code == 200) {
//    results.coinsTopList.forEach((coin) => {
//      AddCoin(coin);
//    });
//  }
    console.log(results);
});

//export { getCurrentCoinTopList, fetchCoinTopListAsync};
