import { LowSync, JSONFileSync } from 'lowdb';

const adapter = new JSONFileSync('dbfile.json');
const db = new LowSync(adapter);

db.read();

/*for (let i = 0; i < db.data.coins.length; i++) {
  const coin = db.data.coins[i];
  if (coin.history[0].market_cap_rank == null) {
    db.data.coins.splice(i, 1);
    console.count("remove");
  } else {
    console.count("keep");
  }
  console.log(coin.history[0].market_cap_rank);
}
db.write();
*/

for (let i = 0; i < db.data.coins.length; i++) {
  const coin = db.data.coins[i];
  if (coin.history[0].market_cap_rank == null) {

    console.log("market_cap_rank = null for coin", coin.name);
  }
}


