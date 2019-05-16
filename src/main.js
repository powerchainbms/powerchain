"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const _ = require("lodash");
var MongoClient = require("mongodb").MongoClient;
const userAuth = require("./userAuth");
const blockchain_1 = require("./blockchain");
const transactionPool_1 = require("./transactionPool");
const wallet_1 = require("./wallet");
const getPort = require("get-port");
const p2p_1 = require("./p2p");
const pc_p2p = require('./pc_p2p');
const initHttpServer = myHttpPort => {
  const app = express();
  app.use(bodyParser.json());
  app.use((err, req, res, next) => {
    if (err) {
      res.status(400).send(err.message);
    }
  });
  app.get("/blocks", (req, res) => {
    res.send(blockchain_1.getBlockchain());
  });
  app.get("/block/:hash", (req, res) => {
    const block = _.find(blockchain_1.getBlockchain(), {
      hash: req.params.hash
    });
    res.send(block);
  });
  app.get("/transaction/:id", (req, res) => {
    const tx = _(blockchain_1.getBlockchain())
      .map(blocks => blocks.data)
      .flatten()
      .find({ id: req.params.id });
    res.send(tx);
  });
  app.get("/address/:address", (req, res) => {
    const unspentTxOuts = _.filter(
      blockchain_1.getUnspentTxOuts(),
      uTxO => uTxO.address === req.params.address
    );
    res.send({ unspentTxOuts: unspentTxOuts });
  });
  app.get("/unspentTransactionOutputs", (req, res) => {
    res.send(blockchain_1.getUnspentTxOuts());
  });
  app.get("/myUnspentTransactionOutputs", (req, res) => {
    res.send(blockchain_1.getMyUnspentTransactionOutputs());
  });
  app.post("/mineRawBlock", (req, res) => {
    if (req.body.data == null) {
      res.send("data parameter is missing");
      return;
    }
    const newBlock = blockchain_1.generateRawNextBlock(req.body.data);
    if (newBlock === null) {
      res.status(400).send("could not generate block");
    } else {
      res.send(newBlock);
    }
  });
  app.post("/mineBlock", (req, res) => {
    const newBlock = blockchain_1.generateNextBlock();
    if (newBlock === null) {
      res.status(400).send("could not generate block");
    } else {
      res.send(newBlock);
    }
  });
  app.get("/balance", (req, res) => {
    const balance = blockchain_1.getAccountBalance();
    res.send({ balance: balance });
  });
  app.get("/address", (req, res) => {
    const address = wallet_1.getPublicFromWallet();
    res.send({ address: address });
  });
  app.post("/mineTransaction", (req, res) => {
    const address = req.body.address;
    const amount = req.body.amount;
    try {
      const resp = blockchain_1.generatenextBlockWithTransaction(
        address,
        amount
      );
      res.send(resp);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(e.message);
    }
  });
  app.post("/sendTransaction", (req, res) => {
    try {
      const address = req.body.address;
      const amount = req.body.amount;
      if (address === undefined || amount === undefined) {
        throw Error("invalid address or amount");
      }
      const resp = blockchain_1.sendTransaction(address, amount);
      res.send(resp);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(e.message);
    }
  });
  app.post("/sendInternetworkTransaction", (req,res) => {
    try {
      const address = req.body.address;
      const amount = req.body.amount;
      const channel = req.body.channel;
      if (address === undefined || amount === undefined) {
        throw Error("invalid address or amount");
      }
      const resp = blockchain_1.sendTransaction(address, amount,channel);
      pc_p2p.sendInterNetworktx(resp);
      res.send(resp);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(e.message);
    }
  });
  app.get("/transactionPool", (req, res) => {
    res.send(transactionPool_1.getTransactionPool());
  });
  app.get("/peers", (req, res) => {
    res.send(
      Object.keys(p2p_1.getSockets())
    );
  });
  app.post("/addPeer", (req, res) => {
    p2p_1.connectToPeers(req.body.peer);
    res.send();
  });
  app.post("/stop", (req, res) => {
    res.send({ msg: "stopping server" });
    process.exit();
  });
  app.listen(myHttpPort, () => {
    console.log("Listening http on port: " + myHttpPort);
  });
};

(async () => {
  // Connection URL
  // var url = "mongodb://localhost";
  var url =
    "mongodb+srv://mahesh:password12345$@powerchain-vstig.mongodb.net/test?retryWrites=true";

  // Use connect method to connect to the server
  const client = new MongoClient(url, { useNewUrlParser: true });
  client.connect(async function(err, client) {
    if (err) throw err;
    console.log("Connected successfully to server");
    wallet_1.initWallet();
    var db = client.db("powerchain");
    var userInfo = await userAuth.login(db);
    // console.log(userInfo + " main log unserinfo");
    const p2p_1 = require("./p2p");
    // const httpPort = parseInt(process.env.HTTP_PORT) || 3002;
    const httpPort = await getPort();
    // const p2pPort = parseInt(process.env.P2P_PORT) || 6002;
    const p2pPort = await getPort();
    initHttpServer(httpPort);
    p2p_1.initP2PServer(p2pPort, userInfo);
    pc_p2p.init(userInfo);
    client.close();
    // console.log("\ndb closed");
  });
})();

//# sourceMappingURL=main.js.map
