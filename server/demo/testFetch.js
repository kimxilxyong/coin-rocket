//1. Import coingecko-api
//import CoinGecko from "coingecko-api";
const CoinGecko = require('coingecko-api');
const querystring = require('querystring');

//import { AddCoin } from "./datastore.js";
//const AddCoin = require("./db/datastore.js");


//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

// Load details about the coins
// page is the page number, one page has 100 entries, ordered by marketcap
const fetchCoinTopListAsync = async (page) => {
  let params = {
    vs_currency: "USD",
    page: page,
    per_page: 100,
    order: CoinGecko.ORDER.MARKET_CAP_DESC,
    price_change_percentage: "24h,7d,14d,30d",
    locale: "en",
    sparkline: false,
    //price_change_percentage: "1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y"
  };
  const url = "https://api.coingecko.com/api/v3/coins/markets?" + querystring.stringify(params);
  console.log(url);

  //let data = await CoinGeckoClient.coins.markets(params).catch((err) => { console.log("XXXXXXXXXXXXXXXXXXXXXXXXX" + err); throw (err); });

  //const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD&order=market_cap_desc&per_page=100&page=10&sparkline=false&price_change_percentage=1h%2C24h%2C7d&locale=en";

  // Default options are marked with *
  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" // otherwise $_POST is empty
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //body: JSON.stringify(data), // body data type must match "Content-Type" header
  });

  let coinList = {code: 0, data: []};

  console.log("---------------------------------");
  console.log(response);
  //console.log(await response.json());
  console.log("---------------------------------");
  if (response.status == 200) {

    coinList.data = await response.json();
    coinList.code = response.status;
    //console.log(coinList);
    //console.log("---------------------------------");

  } else {
    let e = { code: response.status, message: await response.json(), reason: "Bad request" };
    throw (e);
  }


  return (coinList);
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

    //console.log(coins.code);
    //console.log(coins.data);

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
          //coin.score = 0;
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
    throw(e);
  }
};


getCurrentCoinTopList(30).catch(err => console.log(err)).then((results) => {
  if (results) {
    if (results.code == 200) {
      results.coinsTopList.forEach((coin) => {
        //AddCoin(coin);
        console.log(coin);
      });
    }
    console.log("Coins " + results.coinsTopList.length);
  }
});

//export { getCurrentCoinTopList, fetchCoinTopListAsync};
