#!/usr/bin/node

import Constants from "./../coingecko-api-fetch/lib/helpers/constants.js";



// Load the coins from the JSON Webservice
// page is the page number, one page has 100 entries, ordered by marketcap
const fetchCoinTopListAsync = async (requestCount, start, count, timeframe = TIMEFRAME.EVER) => {

  const url = "http://localhost:8080/api/listslice/" + requestCount + "/" + start + "/" + count + "/" + timeframe;
  console.log(url);

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

  let coinList = {};

  //console.log("---------------------------------");
  //console.log(response);
  //console.log("---------------------------------");
  //console.log(await response.json());

  if (response.status == 200) {

    coinList = await response.json();
    //console.log(coinList);
    //console.log("---------------------------------");

  } else {
    let e = { code: response.status, message: await response.json(), reason: "Bad request" };
    throw (e);
  }


  return (coinList);
};

/*
fetchCoinTopListAsync(3, 1, 5000, Constants.TIMEFRAME.MONTHLY).catch(err => console.log(err)).then((results) => {
  //console.log(results);
  if (results) {
    if (results.status == 200) {

      results.coins.forEach((coin) => {
        //AddCoin(coin);
        console.log(coin);
        //console.log(coin.id);
        //console.log(coin.history);
      });
    }
    console.log("Coins " + results.coins.length);
  }
});
*/

fetchCoinTopListAsync(3, 1, 5000, Constants.TIMEFRAME.DAILY)
  .catch(err => console.log(err))
  .then((results) => { console.log("Coins", results.coins.length, "Timeframe", Constants.TIMEFRAME.DAILY); console.log(results); }
);
fetchCoinTopListAsync(3, 1, 5000, Constants.TIMEFRAME.WEEKLY)
  .catch(err => console.log(err))
  .then((results) => { console.log("Coins", results.coins.length, "Timeframe", Constants.TIMEFRAME.WEEKLY); console.log(results); }
);
fetchCoinTopListAsync(3, 1, 5000, Constants.TIMEFRAME.BIWEEKLY)
  .catch(err => console.log(err))
  .then((results) => { console.log("Coins", results.coins.length, "Timeframe", Constants.TIMEFRAME.BIWEEKLY); console.log(results); }
);
fetchCoinTopListAsync(3, 1, 5000, Constants.TIMEFRAME.MONTHLY)
  .catch(err => console.log(err))
  .then((results) => { console.log("Coins", results.coins.length, "Timeframe", Constants.TIMEFRAME.MONTHLY); console.log(results); }
);
fetchCoinTopListAsync(3, 1, 5000, Constants.TIMEFRAME.F200DAY)
  .catch(err => console.log(err))
  .then((results) => { console.log("Coins", results.coins.length, "Timeframe", Constants.TIMEFRAME.F200DAY); console.log(results); }
);
fetchCoinTopListAsync(3, 1, 5000, Constants.TIMEFRAME.YEARLY)
  .catch(err => console.log(err))
  .then((results) => { console.log("Coins", results.coins.length, "Timeframe", Constants.TIMEFRAME.YEARLY); console.log(results); }
);
//export { getCurrentCoinTopList, fetchCoinTopListAsync};
