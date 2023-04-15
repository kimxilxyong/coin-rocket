import { LowSync, JSONFileSync } from 'lowdb';

const adapter = new JSONFileSync('dbfile.json');
const db = new LowSync(adapter);

let databaseIsOpen = false;

export const isDatabaseOpen = () => {
  return databaseIsOpen;
};

export const openDatabase = () => {
  if (databaseIsOpen) {
    throw('Database is already open');
  }
  db.read();  //Load the content of the file into memory
  db.data = db.data || { coins: [] }; //default value
  databaseIsOpen = true;
  return true;
};

export const closeDatabase = () => {
  if (!databaseIsOpen) throw('Database is not open');

  db.write();  // Write the db memory to file
  db.data = { coins: [] }; // Reset to default value
  databaseIsOpen = false;
};

export const sortDatabase = () => {
  // Sort the coins list by score increase
  db.data.coins.sort((coinA, coinB) => {
    return coinB.score - coinA.score;
  });
};

export const getStoredCoinList = (start, count) => {
  if (!databaseIsOpen) throw ('Database is not open');
  let result = [];

  if (db.data.coins.length > start + count) {

    for (let i = start; i < start + count; i++) {
      result.push({
        id: db.data.coins[i].id,
        name: db.data.coins[i].name,
        score: db.data.coins[i].score,
        price: db.data.coins[i].price,
        last_updated: db.data.coins[i].last_updated,
      });
    }
  }
  return result;
};

export const getAllCoins = () => {
  if (!databaseIsOpen) throw('Database is not open');

  return db.data.coins;
};

export const getCoin = (id) => {
  if (!databaseIsOpen) throw('Database is not open');

  return db.data.coins.find(coin => coin.id === id);
};

export const flushDatabase = () => {
  if (databaseIsOpen) {
    db.write();  //Write the db memory to file
  } else {
    throw('Database is not open');
  }
};

export const addCoin = (newcoin) => {

  if (!databaseIsOpen) throw('Database is not open');

  let storedcoin = db.data.coins.find(c => c.id == newcoin.id);
  if (storedcoin) {
    // Update coin record
    if (storedcoin.last_updated.substring(0,10) == newcoin.last_updated.substring(0,10)) {
      // coin with the same date already stored.
      //console.log(`coin ${newcoin.id} with the same date already stored ${newcoin.last_updated}`);
      return false;
    } else {
      // coin with a different date already stored.
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
          score: newcoin.score,
        }
      );
      storedcoin.last_updated = newcoin.last_updated;
      storedcoin.price = newcoin.price;
      storedcoin.score += newcoin.score;
      return true;
    }

  } else {
    // storedcoin undefined, Coin not found, Add new coin record
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
        score: newcoin.score,
      }],
    }); //add data into the "collection"
    return true;
  }

};
