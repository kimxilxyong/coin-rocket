import express from "express";
import morgan from "morgan";
import querystring__default from "querystring";
import { JSONFileSync, LowSync } from "lowdb";
/**
 * @class CoinGecko
 * @author Mark Miscavage <markmiscavage@protonmail.com>
 * @description A Node.js wrapper for the CoinGecko API with no dependencies. For more information, visit: https://www.coingecko.com/api/docs/v3
 * @example
 *     const CoinGecko = require('coingecko-api');
 *     const CoinGeckoClient = new CoinGecko();
 * @public
 * @version 1.0.10
 * @license MIT
* @kind class
 */
class Utilities {
  isString(str) {
    return typeof str === "string" || str instanceof String;
  }
  isStringEmpty(str) {
    if (!this.isString(str))
      return false;
    return str.length == 0;
  }
  isDate(date) {
    if (this.isString(date) || this.isArray(date) || date == void 0 || date == null)
      return false;
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
  }
  isObject(obj) {
    if (this.isArray(obj) || this.isDate(obj))
      return false;
    return obj !== null && typeof obj === "object";
  }
  isNumber(num) {
    return !isNaN(num) && !isNaN(parseInt(num));
  }
  isArray(arr) {
    return Array.isArray(arr);
  }
  _WARN_(title = "", detail = "") {
    process.emitWarning(title, {
      detail,
      code: "CoinGecko"
    });
    return true;
  }
}
const BASE = "https://api.coingecko.com/api/";
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
const Constants = {
  BASE,
  API_VERSION,
  URI,
  REQUESTS_PER_SECOND,
  TIMEOUT,
  ORDER,
  STATUS_UPDATE_CATEGORY,
  STATUS_UPDATE_PROJECT_TYPE,
  EVENT_TYPE
};
const ReturnObject = (success, message, code, data) => {
  return { success, message, code, data };
};
const Utils = new Utilities();
/**
 * @class CoinGecko
 * @author Mark Miscavage <markmiscavage@protonmail.com>
 * @description A Node.js wrapper for the CoinGecko API with no dependencies. For more information, visit: https://www.coingecko.com/api/docs/v3
 * @example
 *     const CoinGecko = require('coingecko-api');
 *     const CoinGeckoClient = new CoinGecko();
 * @public
 * @version 1.0.10
 * @license MIT
* @kind class
 */
class CoinGecko {
  ping() {
    const path = `/ping`;
    return this._request(path);
  }
  global() {
    const path = `/global`;
    return this._request(path);
  }
  get coins() {
    const pathPrefix = "coins";
    return {
      all: (params = {}) => {
        const path = `/${pathPrefix}`;
        return this._request(path, params);
      },
      list: () => {
        const path = `/${pathPrefix}/list`;
        return this._request(path);
      },
      markets: (params = {}) => {
        const path = `/${pathPrefix}/markets`;
        if (!Utils.isObject(params))
          Utils._WARN_("Invalid parameter", "params must be of type: Object");
        if (!Utils.isString(params.vs_currency) || Utils.isStringEmpty(params.vs_currency)) {
          params.vs_currency = "usd";
        }
        if (Utils.isArray(params.ids)) {
          params.ids = params.ids.join(",");
        }
        return this._request(path, params);
      },
      fetch: (coinId, params = {}) => {
        if (!Utils.isString(coinId) || Utils.isStringEmpty(coinId))
          Utils._WARN_("Invalid parameter", "coinId must be of type: String and greater than 0 characters.");
        const path = `/${pathPrefix}/${coinId}`;
        return this._request(path, params);
      },
      fetchTickers: (coinId, params = {}) => {
        if (!Utils.isString(coinId) || Utils.isStringEmpty(coinId))
          Utils._WARN_("Invalid parameter", "coinId must be of type: String and greater than 0 characters.");
        if (Utils.isArray(params.exchange_ids)) {
          params.exchange_ids = params.exchange_ids.join(",");
        }
        const path = `/${pathPrefix}/${coinId}/tickers`;
        return this._request(path, params);
      },
      fetchHistory: (coinId, params = {}) => {
        if (!Utils.isString(coinId) || Utils.isStringEmpty(coinId))
          Utils._WARN_("Invalid parameter", "coinId must be of type: String and greater than 0 characters.");
        if (!Utils.isObject(params))
          Utils._WARN_("Invalid parameter", "params must be of type: Object");
        if (!Utils.isString(params.date) || Utils.isStringEmpty(params.date))
          Utils._WARN_("Missing parameter", "params must include `date` and be a string in format: `dd-mm-yyyy`");
        const path = `/${pathPrefix}/${coinId}/history`;
        return this._request(path, params);
      },
      fetchMarketChart: (coinId, params = {}) => {
        if (!Utils.isString(coinId) || Utils.isStringEmpty(coinId))
          Utils._WARN_("Invalid parameter", "coinId must be of type: String and greater than 0 characters.");
        if (!Utils.isObject(params))
          Utils._WARN_("Invalid parameter", "params must be of type: Object");
        if (!Utils.isString(params.vs_currency) || Utils.isStringEmpty(params.vs_currency)) {
          params.vs_currency = "usd";
        }
        if (params.days == void 0) {
          params.days = 1;
        }
        const path = `/${pathPrefix}/${coinId}/market_chart`;
        return this._request(path, params);
      },
      fetchMarketChartRange: (coinId, params = {}) => {
        if (!Utils.isString(coinId) || Utils.isStringEmpty(coinId))
          Utils._WARN_("Invalid parameter", "coinId must be of type: String and greater than 0 characters.");
        if (!Utils.isObject(params))
          Utils._WARN_("Invalid parameter", "params must be of type: Object");
        if (!Utils.isString(params.vs_currency) || Utils.isStringEmpty(params.vs_currency)) {
          params.vs_currency = "usd";
        }
        if (!Utils.isNumber(params.from))
          Utils._WARN_("Missing parameter", "params must include `from` and be a UNIX timestamp.");
        if (!Utils.isNumber(params.to))
          Utils._WARN_("Missing parameter", "params must include `to` and be a UNIX timestamp.");
        const path = `/${pathPrefix}/${coinId}/market_chart/range`;
        return this._request(path, params);
      },
      fetchStatusUpdates: (coinId, params = {}) => {
        if (!Utils.isString(coinId) || Utils.isStringEmpty(coinId))
          Utils._WARN_("Invalid parameter", "coinId must be of type: String and greater than 0 characters.");
        const path = `/${pathPrefix}/${coinId}/status_updates`;
        return this._request(path, params);
      },
      fetchCoinContractInfo: (contractAddress, assetPlatform = "ethereum") => {
        if (!Utils.isString(contractAddress) || Utils.isStringEmpty(contractAddress))
          Utils._WARN_("Invalid parameter", "contractAddress must be of type: String and greater than 0 characters.");
        if (!Utils.isString(assetPlatform) || Utils.isStringEmpty(assetPlatform))
          Utils._WARN_("Invalid parameter", "assetPlatform must be of type: String and greater than 0 characters.");
        const path = `/${pathPrefix}/${assetPlatform}/contract/${contractAddress}`;
        return this._request(path);
      },
      fetchCoinContractMarketChart: (contractAddress, assetPlatform = "ethereum", params = {}) => {
        if (!Utils.isString(contractAddress) || Utils.isStringEmpty(contractAddress))
          Utils._WARN_("Invalid parameter", "contractAddress must be of type: String and greater than 0 characters.");
        if (!Utils.isString(assetPlatform) || Utils.isStringEmpty(assetPlatform))
          Utils._WARN_("Invalid parameter", "assetPlatform must be of type: String and greater than 0 characters.");
        if (!Utils.isObject(params))
          Utils._WARN_("Invalid parameter", "params must be of type: Object");
        if (!Utils.isString(params.vs_currency) || Utils.isStringEmpty(params.vs_currency)) {
          params.vs_currency = "usd";
        }
        if (params.days == void 0) {
          params.days = 1;
        }
        const path = `/${pathPrefix}/${assetPlatform}/contract/${contractAddress}/market_chart`;
        return this._request(path, params);
      },
      fetchCoinContractMarketChartRange: (contractAddress, assetPlatform = "ethereum", params = {}) => {
        if (!Utils.isString(contractAddress) || Utils.isStringEmpty(contractAddress))
          Utils._WARN_("Invalid parameter", "contractAddress must be of type: String and greater than 0 characters.");
        if (!Utils.isString(assetPlatform) || Utils.isStringEmpty(assetPlatform))
          Utils._WARN_("Invalid parameter", "assetPlatform must be of type: String and greater than 0 characters.");
        if (!Utils.isObject(params))
          Utils._WARN_("Invalid parameter", "params must be of type: Object");
        if (!Utils.isString(params.vs_currency) || Utils.isStringEmpty(params.vs_currency)) {
          params.vs_currency = "usd";
        }
        if (params.days == void 0) {
          params.days = 1;
        }
        const path = `/${pathPrefix}/${assetPlatform}/contract/${contractAddress}/market_chart/range`;
        return this._request(path, params);
      }
    };
  }
  get exchanges() {
    const pathPrefix = "exchanges";
    return {
      all: () => {
        const path = `/${pathPrefix}`;
        return this._request(path);
      },
      list: () => {
        const path = `/${pathPrefix}/list`;
        return this._request(path);
      },
      fetch: (exchangeId) => {
        if (!Utils.isString(exchangeId) || Utils.isStringEmpty(exchangeId))
          Utils._WARN_("Invalid parameter", "exchangeId must be of type: String and greater than 0 characters.");
        const path = `/${pathPrefix}/${exchangeId}`;
        return this._request(path);
      },
      fetchTickers: (exchangeId, params = {}) => {
        if (!Utils.isString(exchangeId) || Utils.isStringEmpty(exchangeId))
          Utils._WARN_("Invalid parameter", "exchangeId must be of type: String and greater than 0 characters.");
        if (Utils.isArray(params.coin_ids)) {
          params.coin_ids = params.coin_ids.join(",");
        }
        const path = `/${pathPrefix}/${exchangeId}/tickers`;
        return this._request(path, params);
      },
      fetchStatusUpdates: (exchangeId, params = {}) => {
        if (!Utils.isString(exchangeId) || Utils.isStringEmpty(exchangeId))
          Utils._WARN_("Invalid parameter", "exchangeId must be of type: String and greater than 0 characters.");
        const path = `/${pathPrefix}/${exchangeId}/status_updates`;
        return this._request(path, params);
      },
      fetchVolumeChart: (exchangeId, params = {}) => {
        if (!Utils.isString(exchangeId) || Utils.isStringEmpty(exchangeId))
          Utils._WARN_("Invalid parameter", "exchangeId must be of type: String and greater than 0 characters.");
        const path = `/${pathPrefix}/${exchangeId}/volume_chart`;
        return this._request(path, params);
      }
    };
  }
  get statusUpdates() {
    return {
      all: (params = {}) => {
        const path = `/status_updates`;
        return this._request(path, params);
      }
    };
  }
  get events() {
    const pathPrefix = "events";
    return {
      all: (params = {}) => {
        const path = `/${pathPrefix}`;
        return this._request(path, params);
      },
      fetchCountries: () => {
        const path = `/${pathPrefix}/countries`;
        return this._request(path);
      },
      fetchTypes: () => {
        const path = `/${pathPrefix}/types`;
        return this._request(path);
      }
    };
  }
  get exchangeRates() {
    return {
      all: () => {
        const path = `/exchange_rates`;
        return this._request(path);
      }
    };
  }
  get simple() {
    return {
      _price: (params = {}) => {
        if (!Utils.isObject(params))
          Utils._WARN_("Invalid parameter", "params must be of type: Object");
        if (Utils.isArray(params.vs_currencies)) {
          params.vs_currencies = params.vs_currencies.join(",");
        }
        if (!Utils.isString(params.vs_currencies) || Utils.isStringEmpty(params.vs_currencies)) {
          params.vs_currencies = "usd";
        }
        if (Utils.isArray(params.ids)) {
          params.ids = params.ids.join(",");
        }
        if (!Utils.isString(params.ids) || Utils.isStringEmpty(params.ids))
          Utils._WARN_("Invalid parameter", "params.ids must be of type: String or Array and greater than 0 characters.");
        const path = `/simple/price`;
        return this._request(path, params);
      },
      get price() {
        return this._price;
      },
      set price(value) {
        this._price = value;
      },
      supportedVsCurrencies: () => {
        const path = `/simple/supported_vs_currencies`;
        return this._request(path);
      },
      fetchTokenPrice: (params = {}, assetPlatform = "ethereum") => {
        if (!Utils.isObject(params))
          Utils._WARN_("Invalid parameter", "params must be of type: Object");
        if (!Utils.isString(assetPlatform) || Utils.isStringEmpty(assetPlatform))
          Utils._WARN_("Invalid parameter", "assetPlatform must be of type: String and greater than 0 characters.");
        if (!params.contract_addresses)
          Utils._WARN_("Missing parameter", "params must include `contract_addresses` and be a of type: String or Object");
        if (!params.vs_currencies)
          Utils._WARN_("Missing parameter", "params must include `vs_currencies` and be a of type: String or Object");
        if (Utils.isArray(params.contract_addresses)) {
          params.contract_addresses = params.contract_addresses.join(",");
        }
        if (Utils.isArray(params.vs_currencies)) {
          params.vs_currencies = params.vs_currencies.join(",");
        }
        const path = `/simple/token_price/${assetPlatform}`;
        return this._request(path, params);
      }
    };
  }
  get finance() {
    return {
      fetchPlatforms: (params = {}) => {
        const path = `/finance_platforms`;
        return this._request(path, params);
      },
      fetchProducts: (params = {}) => {
        const path = `/finance_products`;
        return this._request(path, params);
      }
    };
  }
  get indexes() {
    const pathPrefix = "indexes";
    return {
      all: (params = {}) => {
        const path = `/${pathPrefix}`;
        return this._request(path, params);
      },
      fetch: (indexId) => {
        if (!Utils.isString(indexId) || Utils.isStringEmpty(indexId))
          Utils._WARN_("Invalid parameter", "indexId must be of type: String and greater than 0 characters.");
        const path = `/${pathPrefix}/${indexId}`;
        return this._request(path);
      },
      list: () => {
        const path = `/${pathPrefix}/list`;
        return this._request(path);
      }
    };
  }
  get derivatives() {
    const pathPrefix = "derivatives";
    return {
      fetchTickers: () => {
        const path = `/${pathPrefix}`;
        return this._request(path);
      },
      allExchanges: (params = {}) => {
        const path = `/${pathPrefix}/exchanges`;
        return this._request(path, params);
      },
      fetchExchange: (exchangeId, params = {}) => {
        if (!Utils.isString(exchangeId) || Utils.isStringEmpty(exchangeId))
          Utils._WARN_("Invalid parameter", "exchangeId must be of type: String and greater than 0 characters.");
        const path = `/${pathPrefix}/exchanges/${exchangeId}`;
        return this._request(path, params);
      },
      listExchanges: () => {
        const path = `/${pathPrefix}/exchanges/list`;
        return this._request(path);
      }
    };
  }
  _buildRequestOptions(path, params) {
    if (Utils.isObject(params))
      params = querystring__default.stringify(params);
    else
      params = void 0;
    if (params == void 0)
      path = `/api/v${Constants.API_VERSION}${path}`;
    else
      path = `/api/v${Constants.API_VERSION}${path}?${params}`;
    return {
      path,
      method: "GET",
      host: Constants.HOST,
      port: 443,
      timeout: CoinGecko.TIMEOUT
    };
  }
  _request(path, params) {
    let options = this._buildRequestOptions(path, params);
    return new Promise((resolve, reject) => {
      let url = "https://" + options.host + options.path;
      fetch(url, {
        method: options.method,
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer"
      }).catch((error) => {
        console.log(error);
        reject(error);
      }).then((res) => {
        let body = [];
        if (res.status == 200) {
          res.json().catch((err) => {
            res.status = err.status;
            res.statusMessage = err.message;
          }).then((coins) => {
            body = coins;
            resolve(
              ReturnObject(
                !(res.status < 200 || res.status >= 300),
                res.statusText,
                res.status,
                body
              )
            );
          });
        } else {
          reject(
            ReturnObject(
              !(res.status < 200 || res.status >= 300),
              res.statusText,
              res.status,
              body
            )
          );
        }
      });
    });
  }
}
CoinGecko.API_VERSION = Constants.API_VERSION;
CoinGecko.REQUESTS_PER_SECOND = Constants.REQUESTS_PER_SECOND;
CoinGecko.ORDER = Constants.ORDER;
CoinGecko.STATUS_UPDATE_CATEGORY = Constants.STATUS_UPDATE_CATEGORY;
CoinGecko.STATUS_UPDATE_PROJECT_TYPE = Constants.STATUS_UPDATE_PROJECT_TYPE;
CoinGecko.EVENT_TYPE = Constants.EVENT_TYPE;
CoinGecko.TIMEOUT = Constants.TIMEOUT;
const adapter = new JSONFileSync("dbfile.json");
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
const closeDatabase = () => {
  if (!databaseIsOpen)
    throw "Database is not open";
  db.write();
  db.data = { coins: [] };
  databaseIsOpen = false;
};
const sortDatabase = () => {
  db.data.coins.sort((coinA, coinB) => {
    return coinB.score - coinA.score;
  });
};
const getStoredCoinList = (start, count) => {
  if (!databaseIsOpen)
    throw "Database is not open";
  let result = [];
  if (db.data.coins.length > start + count) {
    for (let i = start; i < start + count; i++) {
      result.Push({
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
const addCoin = (newcoin) => {
  if (!databaseIsOpen)
    throw "Database is not open";
  let storedcoin = db.data.coins.find((c) => c.id == newcoin.id);
  if (storedcoin) {
    if (storedcoin.last_updated.substring(0, 10) == newcoin.last_updated.substring(0, 10)) {
      return false;
    } else {
      storedcoin.history.push(
        {
          current_price: newcoin.current_price,
          market_cap: newcoin.market_cap,
          market_cap_rank: newcoin.market_cap_rank,
          fully_diluted_valuation: newcoin.fully_diluted_valuation,
          total_volume: newcoin.total_volume,
          high_24h: newcoin.high_24h,
          low_24h: newcoin.low_24h,
          price_change_24h: newcoin.price_change_24h,
          price_change_percentage_24h: newcoin.price_change_percentage_24h,
          market_cap_change_24h: newcoin.market_cap_change_24h,
          market_cap_change_percentage_24h: newcoin.market_cap_change_percentage_24h,
          circulating_supply: newcoin.circulating_supply,
          ath: newcoin.ath,
          ath_change_percentage: newcoin.ath_change_percentage,
          ath_date: newcoin.ath_date,
          atl: newcoin.atl,
          atl_change_percentage: newcoin.atl_change_percentage,
          atl_date: newcoin.atl_date,
          roi: newcoin.roi,
          last_updated: newcoin.last_updated,
          price_change_percentage_14d_in_currency: newcoin.price_change_percentage_14d_in_currency,
          price_change_percentage_1y_in_currency: newcoin.price_change_percentage_1y_in_currency,
          price_change_percentage_200d_in_currency: newcoin.price_change_percentage_200d_in_currency,
          price_change_percentage_24h_in_currency: newcoin.price_change_percentage_24h_in_currency,
          price_change_percentage_30d_in_currency: newcoin.price_change_percentage_30d_in_currency,
          price_change_percentage_7d_in_currency: newcoin.price_change_percentage_7d_in_currency,
          score: newcoin.score
        }
      );
      storedcoin.last_updated = newcoin.last_updated;
      storedcoin.price = newcoin.price;
      storedcoin.score += newcoin.score;
      return true;
    }
  } else {
    db.data.coins.push({
      id: newcoin.id,
      symbol: newcoin.symbol,
      name: newcoin.name,
      image: newcoin.image,
      total_supply: newcoin.total_supply,
      max_supply: newcoin.max_supply,
      last_updated: newcoin.last_updated,
      score: newcoin.score,
      history: [{
        current_price: newcoin.current_price,
        market_cap: newcoin.market_cap,
        market_cap_rank: newcoin.market_cap_rank,
        fully_diluted_valuation: newcoin.fully_diluted_valuation,
        total_volume: newcoin.total_volume,
        high_24h: newcoin.high_24h,
        low_24h: newcoin.low_24h,
        price_change_24h: newcoin.price_change_24h,
        price_change_percentage_24h: newcoin.price_change_percentage_24h,
        market_cap_change_24h: newcoin.market_cap_change_24h,
        market_cap_change_percentage_24h: newcoin.market_cap_change_percentage_24h,
        circulating_supply: newcoin.circulating_supply,
        ath: newcoin.ath,
        ath_change_percentage: newcoin.ath_change_percentage,
        ath_date: newcoin.ath_date,
        atl: newcoin.atl,
        atl_change_percentage: newcoin.atl_change_percentage,
        atl_date: newcoin.atl_date,
        roi: newcoin.roi,
        last_updated: newcoin.last_updated,
        price_change_percentage_14d_in_currency: newcoin.price_change_percentage_14d_in_currency,
        price_change_percentage_1y_in_currency: newcoin.price_change_percentage_1y_in_currency,
        price_change_percentage_200d_in_currency: newcoin.price_change_percentage_200d_in_currency,
        price_change_percentage_24h_in_currency: newcoin.price_change_percentage_24h_in_currency,
        price_change_percentage_30d_in_currency: newcoin.price_change_percentage_30d_in_currency,
        price_change_percentage_7d_in_currency: newcoin.price_change_percentage_7d_in_currency,
        score: newcoin.score
      }]
    });
    return true;
  }
};
const CoinGeckoClient = new CoinGecko();
let page = 0;
const fetchCoinTopListAsync = async (page2) => {
  let params = {
    page: page2,
    per_page: 100,
    order: CoinGecko.ORDER.MARKET_CAP_DESC,
    price_change_percentage: "24h,7d,14d,30d,200d,1y"
  };
  let data = await CoinGeckoClient.coins.markets(params).catch((err) => {
    console.log("fetchCoinTopListAsync CATCH: " + err);
    throw err;
  });
  return data;
};
const getCurrentCoinTopList = async (page2, days) => {
  var i = 0;
  var result = {
    code: 0,
    coinsTopList: []
  };
  try {
    let coins = await fetchCoinTopListAsync(page2).catch((e) => {
      e.step = "fetchCoinTopListAsync";
      throw e;
    });
    result.code = coins.code;
    if (coins.code == 200) {
      coins.data.forEach((coin) => {
        if (coin.market_cap_rank && coin.total_volume && coin.circulating_supply && coin.price_change_percentage_24h_in_currency > 0 && coin.price_change_percentage_7d_in_currency > 0 && coin.price_change_percentage_14d_in_currency > 0 && (coin.price_change_percentage_30d_in_currency > 0 || days < 30)) {
          result.coinsTopList.push(coin);
          i++;
        }
      });
      result.coinsTopList.sort((coinA, coinB) => {
        const percentsA = coinA.price_change_percentage_24h_in_currency + coinA.price_change_percentage_7d_in_currency + coinA.price_change_percentage_14d_in_currency + (days >= 30 ? coinA.price_change_percentage_30d_in_currency : 0);
        const percentsB = coinB.price_change_percentage_24h_in_currency + coinB.price_change_percentage_7d_in_currency + coinB.price_change_percentage_14d_in_currency + (days >= 30 ? coinB.price_change_percentage_30d_in_currency : 0);
        coinA.score = 1 + parseInt(percentsA * (1 / (coinA.circulating_supply / coinA.total_volume)));
        coinB.score = 1 + parseInt(percentsB * (1 / (coinB.circulating_supply / coinB.total_volume)));
        return percentsB - percentsA;
      });
    }
    return result;
  } catch (e) {
    throw e;
  }
};
function fetchGecko() {
  getCurrentCoinTopList(page, 30).catch((err) => {
    console.log("Error while fetching page", page);
    console.log(err);
    setTimeout(fetchGecko, 1e3 * 60 * 20);
  }).then((results) => {
    if (!results)
      return;
    if (results.code == 200) {
      if (!isDatabaseOpen())
        openDatabase();
      let i = 0;
      results.coinsTopList.forEach((coin) => {
        if (addCoin(coin)) {
          console.log("[", getCurrentDateTime(), "]", coin.name, coin.score);
          i++;
        }
      });
      console.log("[", getCurrentDateTime(), "] **** PAGE:", page, ", ", results.coinsTopList.length, "Coins fetched, ", i, " added to database");
      if (results.coinsTopList.length == 0) {
        page = 1;
        sortDatabase();
        setTimeout(fetchGecko, 1e3 * 60 * 120);
      } else {
        page++;
        setTimeout(fetchGecko, 1e3 * 60);
      }
      closeDatabase();
    } else {
      page = 1;
      setTimeout(fetchGecko, 1e3 * 60 * 120);
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
function startGeckoBot() {
  page = 1;
  if (!isDatabaseOpen())
    openDatabase();
  setTimeout(fetchGecko, 1e3);
}
function getCoinList(startIndex, count) {
  return getStoredCoinList(startIndex, count);
}
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
console.log("api.js - startGeckoBot");
startGeckoBot();
app.use(express.json());
app.get("/api/list", (req, res) => {
  console.log(req.params);
  const coinList = getCoinList(0, 100);
  res.json(coinList);
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
