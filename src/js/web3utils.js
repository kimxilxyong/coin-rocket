// SPDX-License-Identifier: MIT -->
// Copyright (c) 2020 Kim Il Yong -->
// Version 1.0.0 -->

import { ethers } from "ethers";
import { getTime, sleep } from "../js/utils.js";

// Gas limit for contract calls
const constGasLimit = "500000";
const constGasPrice = "20000000000";


/*
// Ethereum
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
// Metamask
const provider = new ethers.providers.Web3Provider(window.ethereum)
*/
// my local Energi3 testnet node
/* const provider = new ethers.providers.JsonRpcProvider('http://localhost:49796');
const address = argv[2] || "0x771dDB07222A1f9442C91CF04f64F3164771BB62";
const transactions = 2000;
 */
// How many blocks to scan in one iteration (bigger number means more memory)
// After an j blocks are deleted and only blocks with effective balance changes are kept
// Also in one iteration each block is fetched asynchronly (at nearly the same time the fetches are fired)
const crawlerBlocks = 200;

/* if you get eth.getBalance('account', 'block-no') returns 'Error: missing trie node' #17133 */
/* add  😜--syncmode=full --gcmode=archive😝  to your node server startup */
/* https://github.com/ethereum/go-ethereum/issues/17133 */
let trieMessageCount = 0;
const trieMessageShowEveryXMessage = (crawlerBlocks * 20); // show only each X's message, because if you get one, you will get thousands


/* These consts make sure we don't overload the server (hopefully 😇)*/
const scanBlock = 100;
const scanBlockSleep = 100; // milliseconds

export const listWallets = async (web3) => {
  try {
    const result = await sendRPC_personal_listWallets(web3);
    return result;
  } catch (e) {
    return e;
  }
};

function sendRPC_personal_listWallets(web3) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        method: "personal_listWallets",
        params: [],
        jsonrpc: "2.0",
        id: new Date().getTime(),
      },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}

let faucetDetails = {
  version: 0,
  balance: ethers.constants.Zero,
  calculatedBalance: ethers.constants.Zero,
  donorsCount: 0,
  recipientsCount: 0,
  owner: ethers.constants.AddressZero,
  contractAddress: ethers.constants.AddressZero,
  date: new Date(),
  error: 'none yet',
  lastRecipient: {name:"No one", address: ethers.constants.AddressZero, count: 0, amount: ethers.constants.Zero, country: "🗺", date: new Date(),},
};

// Load details about smart contract and returns a faucetDetails object
// faucet must be an instantiated ethers.js Contract
export const fetchFaucetDetailsAsync = async (faucet) => {

  let result = faucetDetails;
  let fetchStep = "getDetails";
  try {

    // TODO REMOVE
    //console.log("Start fetching in web3utils fetchFaucetDetailsAsync");

    let v = faucet.getVersion();

    let o = faucet.getOwner();

    let b = faucet.getBalance();

    let db = faucet.getCalculatedBalance();

    let dc = faucet.getDonorCount();

    let rc = faucet.getRecipientsCount();

    let ca = faucet.getAddress();

    result.version = await v.catch((e) => { fetchStep = "getDetails"; throw (e);});
    result.owner = await o.catch((e) => { fetchStep = "getOwner"; throw (e);});
    result.balance = await b.catch((e) => { fetchStep = "getBalance"; throw (e);});
    result.calculatedBalance = await cb.catch((e) => { fetchStep = "getCalculatedBalance"; throw (e);});
    result.donorsCount = await dc.catch((e) => { fetchStep = "getDonorCount"; throw (e);});
    result.recipientsCount = await rc.catch((e) => { fetchStep = "getRecipientCount"; throw (e); });
    result.contractAddress = await ca.catch((e) => { fetchStep = "getAddress"; throw (e);});

    result.error = "OK";
    // TODO REMOVE
    //console.log("Faucet details async", result);
    return result;
  }
  catch (e) {
    console.log("fetchFaucetDetailsAsync CATCH:", e);
    console.log("e.code", e.code);
    console.log("e.message", e.message);
    console.log("e.reason", e.reason);
    e.step = fetchStep;
    throw(e);
  }
};

// Load details about smart contract and returns a faucetDetails object
export const fetchFaucetDetails = async (providerAddress, faucetAddress, abi) => {

  let result = faucetDetails;

  let fetchStep = "Setup Connection";
  try {
      // If you don't specify a //url//, Ethers connects to the default
      // (i.e. ``http:/\/localhost:8545``)
      //const provider = new ethers.providers.JsonRpcProvider('http://localhost:49796');
      const provider = new ethers.providers.JsonRpcProvider(providerAddress);

      // The provider also allows signing transactions to
      // send ether and pay to change state within the blockchain.
      // For this, we need the account signer...
      // const signer = provider.getSigner(gasDonorAddress);
      // const signer = ethers.Wallet.fromEncryptedJsonSync(json, password);
      // Use a read-only signer for this function
      //const signer = new ethers.VoidSigner(gasDonorAddress, provider);

      // No signer needed here

      // The Contract object
      const faucet = new ethers.Contract(faucetAddress, abi, provider);

      // TODO REMOVE
      //console.log("Start fetching in web3utils");
      fetchStep = "getVersion";
      let r = await faucet.getVersion(); /* .catch((e) => {    console.log("getVersion failed:", e);
                                                          logText = logText + "\n" + getTime() + ": getVersion failed: " + e;
                                                      }); */
      if (r) {
        console.log("in web3utils Faucet Version:", r);
        result.version = r;
      }

      fetchStep = "getOwner";
      r = await faucet.getOwner(); /* .catch((e) => {  logText = logText + "\n" + getTime() + ": getOwner failed: " + e;
                                                  console.log("getOwner failed:", e); }); */
      if (r) {
        console.log("Faucet Owner:", r);
        result.owner = r;
      }

      fetchStep = "getBalance";
      console.log("In web3utils getBalance", result.balance);
      r = await faucet.getBalance(); /* .catch((e) => {console.log("getBalance failed:", e);
                                                  logText = logText + "\n" + getTime() + ": getBalance failed: " + e;
                                                  }); */
      if (r) {
        // TODO REMOVE
        //console.log("Faucet Balance:", parseFloat(ethers.utils.formatEther(r)));
        result.balance = r;
        console.log("In web3utils balance", result.balance);
      }

      fetchStep = "getCalculatedBalance";
      r = await faucet.getCalculatedBalance();/* .catch((e) => { console.log("getCalculatedBalance failed:", e); }); */
      if (r) {
        console.log("Faucet Calculated Balance:", parseFloat(ethers.utils.formatEther(r)));
        result.calculatedBalance = r;
      }

      fetchStep = "getDonorCount";
      r = await faucet.getDonorCount(); /* .catch((e) => { console.log("getDonorCount failed:", e); }); */
      if (r) {
        console.log("Donor Count:", r);
        result.donorsCount = r;
      }

      fetchStep = "getRecipientsCount";
      r = await faucet.getRecipientsCount(); /* .catch((e) => { console.log("getRecipientsCount failed:", e); }); */
      if (r) {
        console.log("Recipients Count:", r);
        result.recipientsCount = r;
      }

      fetchStep = "getAddress";
      r = await faucet.getAddress(); /* .catch((e) => { console.log("getAddress failed:", e); }); */
      if (r) {
        console.log("Address:", r);
        result.contractAddress = r;
      }

      result.error = "OK";
      return result;
  }
  catch (e) {
    console.log("fetchFaucetDetails CATCH:", e);
    e.step = fetchStep;
    throw(e);
  }
};




/**
* Calls the function which actually executes the contract call, handles errors and sets the name (if changed)
*
* @param faucet is an ethers.js initiated contract, @example faucet = new ethers.Contract(contractAddr, abi, signer);
* @param name is the entered nickname of the recipient and supports UTF - 8
* @param country is the flag of the users country determined by IP geolocation api, eg "🇦🇹"
* @param eth the value to request in NRG as a number
* @param confirmations to wait for
* @param transaction response callback
* @return a transaction hash or an error
* the sending address is contained in the signer: const signer = provider.getSigner(fromAddress);
* the faucet contract is constructed by: const faucet = new ethers.Contract(contractAddr, abi, signer);
*/
export const callRequest = async (faucet, name, country, eth, confirmations, callback) => {
  let result = {
    status: false,
    transactionHash: ethers.constants.HashZero,
    blockNumber: 0,
    blockHash: ethers.constants.HashZero,
    gasUsed: 0,
    confirmations: 0,
    logsBloom: ethers.constants.HashZero,
    sdnTX: ethers.constants.HashZero,
    error: null,
    errorReason: "",
    errorCode: "",
    errorStep: "",
  };

  try {
    let currentName = await faucet.getRecipientName(faucet.signer._address).catch((e) => { e.step = "getRecipientName"; throw (e); });
    console.log("callDonation eth", eth);
    let txResult = await requestDonationAndWait(faucet, name, country, ethers.utils.parseEther(eth.toString()).toString(), confirmations, callback).catch((e) => { e.step = "requestDonationAndWait"; throw (e); });

    result.status = txResult.status;
    result.gasUsed = txResult.gasUsed;
    result.logsBloom = txResult.logsBloom;
    result.blockHash = txResult.blockHash;
    result.transactionHash = txResult.transactionHash;
    result.blockNumber = txResult.blockNumber;
    result.confirmations = txResult.confirmations;

    if (result.status) {

      // Update recipient name
      if (currentName && name && currentName !== name) {
        // update recipient name
        let sdnTX = await faucet.setRecipientName(name).catch((e) => { e.step = "SetName failed"; throw (e); });
        result.sdnTX = sdnTX;
      }
      console.log("****************************************");
      console.log("Donation from Faucet succesfull 🤑");
      console.log("Gas used", result.gasUsed.toNumber());
      console.log("Status", result.status);
      console.log("Transaction Hash", result.transactionHash);
      console.log("Block Number", result.blockNumber);
      console.log("****************************************");
      console.log("🏁 Finished 🏁");
      console.log(name, ", you have successfully received", eth , "NRG");

    } else {
      console.log("requestDonationAndWait returned status false");
      console.log(r);
      result.error = "Transaction failed";
      result.errorReason = "Status is false";
      result.errorCode = "CALL_EXCEPTION";
    }

    return result;

  } catch (e) {
    if (e.toString().includes("authentication needed")) {
      console.log("***********************************************************************************************");
      if (e.toString().includes("only staking")) {
        console.log("Your account is in staking only mode, you need to unlock it in the nodes console.");
        result.error = new Error("Your account is in staking only mode, you need to unlock it in the nodes console.");
        result.errorReason = "Your account is in staking only mode, you need to unlock it in the nodes console.";
      } else {
        console.log("Your account is locked, you need to unlock it in the nodes console.");
        result.error = new Error("Your account is locked, you need to unlock it in the nodes console.");
        result.errorReason = "Your account is locked, you need to unlock it in the nodes console.";
      }
      console.log("personal.unlockAccount('" + faucet.signer._address + "',null,secondsToUnlock,false)");
      console.log("***********************************************************************************************");

      result.errorStep = "personal.unlockAccount('" + faucet.signer._address + "',null,0,false)";

      if (!result.errorReason) {
        result.errorReason = "Account is not unlocked";
      }
      result.errorCode = "INVALID_SIGNER";

    } else {
      console.log("*********************");
      console.log("Donation failed with:", e);
      result.error = e;
      if (e.reason) {
        result.errorReason = e.reason;
      } else {
        result.errorReason = e.toString();
      }
      if (e.code) {
        result.errorCode = e.code;
      } else {
        result.errorCode = "JAVASCRIPT_EXCEPTION";
      }
      if (e.step) {
        result.errorStep = e.step;
      } else {
        result.errorStep = "unknown location";
      }
      console.log("Throwing", result);
      console.log("*********************");
    }
    // TODO REMOVE
    console.log("catch in requestDonation, throwing", result);
    throw(result);
  }
};

/**
* Calls the contract.requestDonation and handles the transaction receipt
*
* @param contract is an ethers.js initiated contract, @example faucet = new ethers.Contract(contractAddr, abi, signer);
* @param recipientName is the entered nickname of the recipient and supports UTF - 8
* @param recipientCountry is the flag of the users country determined by IP geolocation api, eg "🇦🇹"
* @param wei the value to request in wei as a string, eg from ethers.utils.parseEther(donationInETH).toString()
* @param waitForConfirmations number of transaction receipt's to wait for
* @param progressCallback is called on every confirmation
* @return a transaction receipt {receipt.gasUsed, receipt.logsBloom, receipt.blockHash, receipt.transactionHash, receipt.logs, receipt.blockNumber, receipt.confirmations, receipt.status=1 success, =0 reverted}
*/
const requestDonationAndWait = async (contract, recipientName, recipientCountry, wei, waitForConfirmations, progressCallback) => {

    let lastConfirms = -2;
    try {
      console.log("testing if requestDonation would execute");
      let r = await contract.callStatic.requestDonation(contract.signer._address, wei, recipientName, ethers.utils.toUtf8Bytes(recipientCountry), { gasLimit: constGasLimit, }).catch((e) => { e.step = "contract.callStatic.requestDonation"; throw (e); });
      if (r) {
        console.log("requestDonation would execute, continue ...");

        console.log("Calling faucet.requestDonation(", recipientName, ",", recipientCountry, ",", wei, ")");
        console.log("Transaction is pending, waiting for execution response ... ");

        const txResponse = await contract.requestDonation(contract.signer._address, wei, recipientName, ethers.utils.toUtf8Bytes(recipientCountry), { gasLimit: constGasLimit, }).catch((e) => { e.step = "contract.requestDonation"; throw (e); });

        console.log("Transaction", txResponse.hash, "was executed, waiting for miners ... ");

        // Progress callback for transaction
        if (progressCallback) {
          txResponse.time = getTime();
          progressCallback(txResponse);
        }

        const receiptHandler = (receipt) => {

          if (receipt.confirmations === lastConfirms) {
            // I don't know why each confirmation comes twice, the two receipts are exactly the same, - ignore the second
            return;
          }

          // Progress callback for transaction reciept
          if (progressCallback) {
            receipt.time = getTime();
            progressCallback(receipt);
          }

          if (lastConfirms === -2) {
            console.log("Transaction was mined in Block", receipt.blockNumber, "and used", receipt.gasUsed.toNumber(), "gas");
            console.log("Waiting for", waitForConfirmations, "confirmations");
            lastConfirms = -1;
            return;
          }
          console.log("Receipt Confirmation:", receipt.confirmations);
          console.log("****************************************");
          if ((receipt.transactionHash !== txResponse.hash) || (receipt.confirmation < lastConfirms)) {
            console.log("Chain reorg!! 🐞 🥵");
          }
          lastConfirms = receipt.confirmations;
        };
        contract.provider.on(txResponse.hash, receiptHandler);

        // Wait for number of confirmations
        txResponse.confirmations = 0;
        const txReceipt = await txResponse.wait(waitForConfirmations).catch((e) => { e.step = "txResponse.wait"; throw (e); });

        contract.provider.removeListener(txResponse.hash, receiptHandler);

        return txReceipt;
      } else {
        let error = { reason: 'unhandled Error', code: 'ETHER_INTERNAL', };
        throw (error);
      }

    } catch (e) {
      if (!e.step) {
        e.step = "catch requestDonationAndWait";
      }
      console.log("catch in requestDonationAndWait, throwing", e);
      throw (e);
    }
};

/**
* Builds the url arguments to call Donation from the webwallet
*
* @param contract is an ethers.js initiated contract, @example faucet = new ethers.Contract(contractAddr, abi, signer);
* @param recipientName is the entered nickname of the donor and supports UTF - 8
* @param recipientCountry is the flag of the users country determined by IP geolocation api, eg "🇦🇹"
* @param eth the value to donate in NRG as a number, is NOT converted into wei with ethers.utils.parseEther(eth.toString()).toString()
* @return {url='', status=1 success, =0 reverted}
*/
export const buildCallrequestDonationArguments = async (contract, recipientAddress, recipientName, recipientCountry, eth) => {

  let result = { status: 0, url: "", error: {code: "JAVASCRIPT_911", reason: "callStatic returned null", message: "🥶 CALL 911 or shout U RTardApe",},};
  try {

    const wei = ethers.utils.parseEther(eth.toString()).toString();
    console.log("Fake calling faucet.callStatic.requestDonation(", recipientAddress, "," + recipientName, ",", recipientCountry, ",", wei, ")");

    // Ask for donation, but do not really execute
    const r = await contract.callStatic.requestDonation(recipientAddress, wei, recipientName, ethers.utils.toUtf8Bytes(recipientCountry), { gasLimit: constGasLimit, }).catch((e) => { e.step = "contract.callStatic.requestDonation"; throw (e); });
    if (r) {
      console.log("requestDonation would execute, populate unsigned tx data ...");

      let unsignedTx = await contract.populateTransaction.requestDonation(recipientAddress, wei, recipientName, ethers.utils.toUtf8Bytes(recipientCountry), { gasLimit: constGasLimit, }).catch((e) => { e.step = "contract.populateTransaction.requestDonation"; throw (e); });
      if (unsignedTx) {
        console.log(unsignedTx);
        console.log("Building webwallet URL for requesting", eth, "NRG to contract", contract.address);

        let url = "https://wallet.test3.energi.network/account/send/?gasLimit=" + constGasLimit + "&value=0";
        url += "&gasPrice=" + constGasPrice;
        url += "&to=" + contract.address;
        url += "&data=" + unsignedTx.data;
        url += "&warnings=0&ts=" + Math.floor(new Date() / 1000);

        console.log("Finished building URL:", url);

      /* https://wallet.test3.energi.network/account/send/?gasLimit=3000000&value=0&to=0x0000000000000000000000000000000000000309&data=0x6112fe2e00000000000000000000000000000000000000000000003635c9adc5dea00000&warnings=0&ts=1608741991354 */

        result.status = 1;
        result.url = url;
        result.error = { code: "NO_ERROR", reason: "", message: "", };
      }

    } else {
      console.log("TRANSACTION FAILED WITHOUT EXCEPTION 🥶 CALL 911");
      result.status = -1;
    }
    return result;

  } catch (e) {
    if (!e.step) {
      e.step = "catch buildCallrequestDonationArguments";
    }
    console.log("catch in buildCallrequestDonationArguments, throwing", e);
    throw (e);
  }
};

/**
* Calls the function which actually executes the contract call, handles errors and sets the name (if changed)
*
* @param faucet is an ethers.js initiated contract, @example faucet = new ethers.Contract(contractAddr, abi, signer);
* @param name is the entered nickname of the donor and supports UTF - 8
* @param country is the flag of the users country determined by IP geolocation api, eg "🇦🇹"
* @param eth the value to donate in NRG as a number
* @param confirmations to wait for
* @param transaction response callback
* @return a transaction hash or an error
* the sending address is contained in the signer: const signer = provider.getSigner(fromAddress);
* the faucet contract is constructed by: const faucet = new ethers.Contract(contractAddr, abi, signer);
*/
export const callDonation = async (faucet, name, country, eth, confirmations, callback) => {
  let result = {
    status: false,
    transactionHash: ethers.constants.HashZero,
    blockNumber: 0,
    blockHash: ethers.constants.HashZero,
    gasUsed: 0,
    confirmations: 0,
    logsBloom: ethers.constants.HashZero,
    sdnTX: ethers.constants.HashZero,
    error: null,
    errorReason: "",
    errorCode: "",
    errorStep: "",
  };

  try {
    /* let currentName = await faucet.getDonorName(fromAddress).catch((e) => { e.step = "getDonorName"; throw (e); }); */
    let currentName = await faucet.getDonorName(faucet.signer._address).catch((e) => { e.step = "getDonorName"; throw (e); });
    console.log("callDonation eth", eth);
    let txResult = await callDonationAndWait(faucet, name, country, ethers.utils.parseEther(eth.toString()).toString(), confirmations, callback).catch((e) => { e.step = "callDonationAndWait"; throw (e); });

    result.status = txResult.status;
    result.gasUsed = txResult.gasUsed;
    result.logsBloom = txResult.logsBloom;
    result.blockHash = txResult.blockHash;
    result.transactionHash = txResult.transactionHash;
    result.blockNumber = txResult.blockNumber;
    result.confirmations = txResult.confirmations;

    if (result.status) {

      // Update donors name if changed
      if (currentName && name && currentName !== name) {
          // update donor name
        let sdnTX = await faucet.setDonorName(name).catch((e) => { e.step = "SetName failed"; throw (e); });
        result.sdnTX = sdnTX;
      }
      console.log("****************************************");
      console.log("Donation to Faucet succesfull 🤑");
      console.log("Gas used", result.gasUsed.toNumber());
      console.log("Status", result.status);
      console.log("Transaction Hash", result.transactionHash);
      console.log("Block Number", result.blockNumber);
      console.log("****************************************");
      console.log("🏁 Finished 🏁");
      console.log("Thank you '", name, "'for donating", eth , "NRG");

    } else {
      console.log("callDonationAndWait returned status false");
      console.log(r);
      result.error = "Transaction failed";
      result.errorReason = "Status is false";
      result.errorCode = "CALL_EXCEPTION";
    }

    return result;

  } catch (e) {
    if (e.toString().includes("authentication needed")) {
      console.log("***********************************************************************************************");
      if (e.toString().includes("only staking")) {
        console.log("Your account is in staking only mode, you need to unlock it in the nodes console.");
        result.error = new Error("Your account is in staking only mode, you need to unlock it in the nodes console.");
        result.errorReason = "Your account is in staking only mode, you need to unlock it in the nodes console.";
      } else {
        console.log("Your account is locked, you need to unlock it in the nodes console.");
        result.error = new Error("Your account is locked, you need to unlock it in the nodes console.");
        result.errorReason = "Your account is locked, you need to unlock it in the nodes console.";
      }
      console.log("personal.unlockAccount('" + faucet.signer._address + "',null,secondsToUnlock,false)");
      console.log("***********************************************************************************************");

      result.errorStep = "personal.unlockAccount('" + faucet.signer._address + "',null,0,false)";

      if (!result.errorReason) {
        result.errorReason = "Account is not unlocked";
      }
      result.errorCode = "INVALID_SIGNER";

    } else {
      console.log("*********************");
      console.log("Donation failed with:", e);
      result.error = e;
      if (e.reason) {
        result.errorReason = e.reason;
      } else {
        result.errorReason = e.toString();
      }
      if (e.code) {
        result.errorCode = e.code;
      } else {
        result.errorCode = "JAVASCRIPT_EXCEPTION";
      }
      if (e.step) {
        result.errorStep = e.step;
      } else {
        result.errorStep = "unknown location";
      }
      console.log("Throwing", result);
      console.log("*********************");
    }
    // TODO REMOVE
    console.log("catch in callDonation, throwing", result);
    throw(result);
  }

};

/**
* Calls the contract.Donation and handles the transaction receipt
*
* @param contract is an ethers.js initiated contract, @example faucet = new ethers.Contract(contractAddr, abi, signer);
* @param donorName is the entered nickname of the donor and supports UTF - 8
* @param donorCountry is the flag of the users country determined by IP geolocation api, eg "🇦🇹"
* @param wei the value to donate in wei as a string, eg from ethers.utils.parseEther(donationInETH).toString()
* @param waitForConfirmations number of transaction receipt's to wait for
* @param progressCallback is called on every confirmation
* @return a transaction receipt {receipt.gasUsed, receipt.logsBloom, receipt.blockHash, receipt.transactionHash, receipt.logs, receipt.blockNumber, receipt.confirmations, receipt.status=1 success, =0 reverted}
*/
const callDonationAndWait = async (contract, donorName, donorCountry, wei, waitForConfirmations, progressCallback) => {

    let lastConfirms = -2;
    try {
      console.log("Calling faucet.Donation(", donorName, ",", donorCountry, ",", wei, ")");
      console.log("Transaction is pending, waiting for execution response ... ");

      const txResponse = await contract.Donation(donorName, ethers.utils.toUtf8Bytes(donorCountry), { value: wei, }).catch((e) => { e.step = "contract.Donation"; throw (e); });

      console.log("Transaction", txResponse.hash, "was executed, waiting for miners ... ");

      // Progress callback for transaction
      if (progressCallback) {
        txResponse.time = getTime();
        progressCallback(txResponse);
      }

      const receiptHandler = (receipt) => {

        if (receipt.confirmations === lastConfirms) {
            // I don't know why each confirmation comes twice, the two receipts are exactly the same, - ignore the second
            return;
        }

        // Progress callback for transaction reciept
        if (progressCallback) {
          receipt.time = getTime();
          progressCallback(receipt);
        }

        if (lastConfirms === -2) {
            console.log("Transaction was mined in Block", receipt.blockNumber, "and used", receipt.gasUsed.toNumber(), "gas");
            console.log("Waiting for", waitForConfirmations, "confirmations");
            lastConfirms = -1;
            return;
        }
        console.log("Receipt Confirmation:", receipt.confirmations);
        console.log("****************************************");
        if ((receipt.transactionHash !== txResponse.hash) || (receipt.confirmation < lastConfirms)) {
            console.log("Chain reorg!! 🐞 🥵");
        }
        lastConfirms = receipt.confirmations;
      };
      contract.provider.on(txResponse.hash, receiptHandler);

      // Wait for number of confirmations
      txResponse.confirmations = 0;
      const txReceipt = await txResponse.wait(waitForConfirmations).catch((e) => { e.step = "txResponse.wait"; throw (e); });

      contract.provider.removeListener(txResponse.hash, receiptHandler);

      return txReceipt;

    } catch (e) {
      if (!e.step) {
        e.step = "catch callDonationAndWait";
      }
      console.log("catch in callDonationAndWait, throwing", e);
      throw (e);
    }
};

/**
* Builds the url arguments to call Donation from the webwallet
*
* @param contract is an ethers.js initiated contract, @example faucet = new ethers.Contract(contractAddr, abi, signer);
* @param donorName is the entered nickname of the donor and supports UTF - 8
* @param donorCountry is the flag of the users country determined by IP geolocation api, eg "🇦🇹"
* @param eth the value to donate in NRG as a number, is NOT converted into wei with ethers.utils.parseEther(eth.toString()).toString()
* @return {url='', status=1 success, =0 reverted}
*/
export const buildCallDonationArguments = async (contract, donorName, donorCountry, eth) => {

  let result = { status: 0, url: "", error: {code: "JAVASCRIPT_911", reason: "callStatic returned null", message: "🥶 CALL 911 or shout U RTardApe",},};
  try {

    const wei = ethers.utils.parseEther(eth.toString()).toString();
    console.log("Fake calling faucet.callStatic.Donation(", donorName, ",", donorCountry, ",", wei, ")");

    // Ask for donation, but do not really execute
    const r = await contract.callStatic.Donation(donorName, ethers.utils.toUtf8Bytes(donorCountry), { gasLimit: constGasLimit, value: wei, }).catch((e) => { e.step = "contract.callStatic.Donation"; throw (e); });
    if (r) {
      console.log("Donation would execute, populate unsigned tx data ...");

      let unsignedTx = await contract.populateTransaction.Donation(donorName, ethers.utils.toUtf8Bytes(donorCountry)).catch((e) => { e.step = "contract.populateTransaction.Donation"; throw (e); });
      if (unsignedTx) {
        console.log(unsignedTx);
        console.log("Building webwallet URL for donating", eth, "NRG to contract", contract.address);

        let url = "https://wallet.test3.energi.network/account/send/?gasLimit=" + constGasLimit + "&value=" + eth.toString();
        url += "&gasPrice=" + constGasPrice;
        url += "&to=" + contract.address;
        url += "&data=" + unsignedTx.data;
        url += "&warnings=0&ts=" + Math.floor(new Date() / 1000);

        console.log("Finished building URL:", url);

      /* https://wallet.test3.energi.network/account/send/?gasLimit=3000000&value=0&to=0x0000000000000000000000000000000000000309&data=0x6112fe2e00000000000000000000000000000000000000000000003635c9adc5dea00000&warnings=0&ts=1608741991354 */

        result.status = 1;
        result.url = url;
      }

    } else {
      console.log("TRANSACTION FAILED WITHOUT EXCEPTION 🥶 CALL 911");
      result.status = -1;
    }
    return result;

  } catch (e) {
    if (!e.step) {
      e.step = "catch buildCallDonationArguments";
    }
    console.log("catch in buildCallDonationArguments, throwing", e);
    throw (e);
  }
};
