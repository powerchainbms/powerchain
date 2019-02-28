"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const swarm = require("discovery-swarm");
const defaults = require("dat-swarm-defaults");
const WebSocket = require("ws");
const blockchain_1 = require("./blockchain");
const transactionPool_1 = require("./transactionPool");
const main = require("./main");
const sockets = [];
let connSeq = 0;
const peers = {};
var MessageType;

const userDetails = main.userDetails();
const config = defaults({
  id: userDetails.userHash,
  tcp: true
});
const sw = swarm(config);

(function(MessageType) {
  MessageType[(MessageType["QUERY_LATEST"] = 0)] = "QUERY_LATEST";
  MessageType[(MessageType["QUERY_ALL"] = 1)] = "QUERY_ALL";
  MessageType[(MessageType["RESPONSE_BLOCKCHAIN"] = 2)] = "RESPONSE_BLOCKCHAIN";
  MessageType[(MessageType["QUERY_TRANSACTION_POOL"] = 3)] =
    "QUERY_TRANSACTION_POOL";
  MessageType[(MessageType["RESPONSE_TRANSACTION_POOL"] = 4)] =
    "RESPONSE_TRANSACTION_POOL";
})(MessageType || (MessageType = {}));
class Message {}
const initP2PServer = p2pPort => {
  console.log("User ID: " + userDetails.userHash.toString("hex"));
  sw.listen(p2pPort);
  sw.join("bmsnet");
  //   const server = new WebSocket.Server({ port: p2pPort });

  sw.on("connection", (conn, info) => {
    const seq = connSeq;
    const peerId = info.id.toString("hex");
    console.log(`Connected #${seq} to peer: ${peerId}`);
    //conn.setKeepAlive(true, 600)
    initConnection(seq, peerId, conn);
  });

  //   server.on("connection", ws => {
  //     initConnection(ws);
  //   });
  console.log("listening websocket p2p port on: " + p2pPort);
};
exports.initP2PServer = initP2PServer;
const getSockets = () => peers;
exports.getSockets = getSockets;

const initConnection = (seq, peerId, conn) => {
  if (!peers[peerId]) {
    peers[peerId] = {};
  }
  peers[peerId].conn = conn;
  peers[peerId].seq = seq;
  connSeq++;
  //   sockets.push(ws);
  initMessageHandler(conn);
  initErrorHandler(conn, peerId, seq);
  write(conn, queryChainLengthMsg());
  // query transactions pool only some time after chain query
  //   setTimeout(() => {
  //     broadcast(queryTransactionPoolMsg());
  //   }, 500);
  //   askUser();
};

const JSONToObject = data => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log("ERRRRRRRRRRRRR  :" + e);
    return null;
  }
};

const initMessageHandler = conn => {
  conn.on("data", data => {
    try {
      const message = JSONToObject(data);
      if (message === null) {
        console.log("could not parse received JSON message: " + data);
        return;
      }
      console.log("Received message: %s", JSON.stringify(message));
      switch (message.type) {
        case MessageType.QUERY_LATEST:
          console.log("sending entire chain");
          const temp = responseLatestMsg();
          console.log(temp);
          write(conn, temp);
          break;
        case MessageType.QUERY_ALL:
          write(conn, responseChainMsg());
          break;
        case MessageType.RESPONSE_BLOCKCHAIN:
          const receivedBlocks = JSONToObject(message.data);
          if (receivedBlocks === null) {
            console.log(
              "invalid blocks received: %s",
              JSON.stringify(message.data)
            );
            break;
          }
          handleBlockchainResponse(receivedBlocks);
          break;
        case MessageType.QUERY_TRANSACTION_POOL:
          write(conn, responseTransactionPoolMsg());
          break;
        case MessageType.RESPONSE_TRANSACTION_POOL:
          const receivedTransactions = JSONToObject(message.data);
          if (receivedTransactions === null) {
            console.log(
              "invalid transaction received: %s",
              JSON.stringify(message.data)
            );
            break;
          }
          receivedTransactions.forEach(transaction => {
            try {
              blockchain_1.handleReceivedTransaction(transaction);
              // if no error is thrown, transaction was indeed added to the pool
              // let's broadcast transaction pool
              broadCastTransactionPool();
            } catch (e) {
              console.log(e.message);
            }
          });
          break;
      }
    } catch (e) {
      console.log(e);
    }
  });
};
const write = (conn, message) => conn.write(JSON.stringify(message));
const broadcast = message => {
  for (let id in peers) {
    peers[id].conn.write(message);
  }
  // sockets.forEach(socket => write(socket, message));
};
const queryChainLengthMsg = () => ({
  type: MessageType.QUERY_LATEST,
  data: null
});
const queryAllMsg = () => ({ type: MessageType.QUERY_ALL, data: null });
const responseChainMsg = () => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify(blockchain_1.getBlockchain())
});
const responseLatestMsg = () => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify([blockchain_1.getLatestBlock()])
});
const queryTransactionPoolMsg = () => ({
  type: MessageType.QUERY_TRANSACTION_POOL,
  data: null
});
const responseTransactionPoolMsg = () => ({
  type: MessageType.RESPONSE_TRANSACTION_POOL,
  data: JSON.stringify(transactionPool_1.getTransactionPool())
});
const initErrorHandler = (conn, peerId, seq) => {
  //   const closeConnection = myWs => {
  //     console.log("connection failed to peer: " + myWs.url);
  //     sockets.splice(sockets.indexOf(myWs), 1);
  //   };
  //   ws.on("close", () => closeConnection(ws));
  //   ws.on("error", () => closeConnection(ws));
  conn.on("close", () => {
    if (peers[peerId].seq === seq) {
      console.log("peer exited: " + JSON.stringify(peers[peerId].seq));
      delete peers[peerId];
    }
  });
};
const handleBlockchainResponse = receivedBlocks => {
  if (receivedBlocks.length === 0) {
    console.log("received block chain size of 0");
    return;
  }
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  if (!blockchain_1.isValidBlockStructure(latestBlockReceived)) {
    console.log("block structuture not valid");
    return;
  }
  const latestBlockHeld = blockchain_1.getLatestBlock();
  if (latestBlockReceived.index > latestBlockHeld.index) {
    console.log(
      "blockchain possibly behind. We got: " +
        latestBlockHeld.index +
        " Peer got: " +
        latestBlockReceived.index
    );
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      if (blockchain_1.addBlockToChain(latestBlockReceived)) {
        broadcast(responseLatestMsg());
      }
    } else if (receivedBlocks.length === 1) {
      console.log("We have to query the chain from our peer");
      broadcast(queryAllMsg());
    } else {
      console.log("Received blockchain is longer than current blockchain");
      blockchain_1.replaceChain(receivedBlocks);
    }
  } else {
    console.log(
      "received blockchain is not longer than received blockchain. Do nothing"
    );
  }
};
const broadcastLatest = () => {
  broadcast(responseLatestMsg());
};
exports.broadcastLatest = broadcastLatest;
// const connectToPeers = newPeer => {
//   const ws = new WebSocket(newPeer);
//   ws.on("open", () => {
//     initConnection(ws);
//   });
//   ws.on("error", () => {
//     console.log("connection failed");
//   });
// };
// exports.connectToPeers = connectToPeers;
const broadCastTransactionPool = () => {
  broadcast(responseTransactionPoolMsg());
};
exports.broadCastTransactionPool = broadCastTransactionPool;
//# sourceMappingURL=p2p.js.map

// const askUser = async () => {
//   rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   });

//   rl.question("Send message: ", message => {
//     // Broadcast to peers
//     for (let id in peers) {
//       peers[id].conn.write(message);
//     }
//     rl.close();
//     rl = undefined;
//     askUser();
//   });
// };
