Object.defineProperty(exports, '__esModule', { value: true });
const swarm = require('discovery-swarm');
const defaults = require('dat-swarm-defaults');
const blockchain_1 = require('./blockchain');
const transactionPool_1 = require('./transactionPool');
const _ = require("lodash");

let connSeq = 0;
const peers = {};
let MessageType;
const userDetails = null;
const userId = null;

exports.setUserDetailsInPC = (userInfo) => {userDetails = _.cloneDeep(userInfo)}
exports.setUserIdInPC = (userIdentity) => {userId = _.cloneDeep(userIdentity)}

(function (MessageType) {
  MessageType[(MessageType.QUERY_LATEST = 0)] = 'QUERY_LATEST';
  MessageType[(MessageType.QUERY_ALL = 1)] = 'QUERY_ALL';
  MessageType[(MessageType.RESPONSE_BLOCKCHAIN = 2)] = 'RESPONSE_BLOCKCHAIN';
  MessageType[(MessageType.QUERY_TRANSACTION_POOL = 3)] = 'QUERY_TRANSACTION_POOL';
  MessageType[(MessageType.RESPONSE_TRANSACTION_POOL = 4)] = 'RESPONSE_TRANSACTION_POOL';
}(MessageType || (MessageType = {})));
class Message {}
const init_PC_P2PServer = (p2pPort) => {
  const config = defaults({
    id: userId,
    tcp: true,
  });
  const sw = swarm(config);
  console.log(`User ID: ${userId}`);
  sw.listen(p2pPort);
  console.log('Joining channel: powerchain');
  sw.join('powerchain');

  const genesisTransaction = {
    txIns: [{ signature: '', txOutId: '', txOutIndex: 0 }],
    txOuts: [{
      address: userDetails.publicKey,
      amount: 50,
    }],
    id: 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3',
  };
  console.log(userDetails.publicKey);

  sw.on('connection', (conn, info) => {
    const seq = connSeq;
    const peerId = info.id.toString('hex');
    console.log(`Connected #${seq} to peer: ${peerId}`);
    initConnection(seq, peerId, conn);
  });
  console.log(`listening websocket p2p port on: ${p2pPort}`);
};
exports.init_PC_P2PServer = init_PC_P2PServer;
// const getSockets = () => peers;
// exports.getSockets = getSockets;

const initConnection = (seq, peerId, conn) => {
  if (!peers[peerId]) {
    peers[peerId] = {};
  }
  peers[peerId].conn = conn;
  peers[peerId].seq = seq;
  connSeq++;
  initMessageHandler(conn);
  initErrorHandler(conn, peerId, seq);
  write(conn, queryChainLengthMsg());
};

const JSONToObject = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log(`ERRRRRRRRRRRRR  :${e}`);
    return null;
  }
};

const initMessageHandler = (conn) => {
  conn.on('data', (data) => {
    try {
      const message = JSONToObject(data);
      if (message === null) {
        console.log(`could not parse received JSON message: ${data}`);
        return;
      }
      console.log('Received message: %s', JSON.stringify(message));
      switch (message.type) {
        case 'interNetworkTransaction':
              transactionPool_1.insertTxIntoTxPool(message.tx);
      }
    } catch (e) {
      console.log(e);
    }
  });
};
const write = (conn, message) => conn.write(JSON.stringify(message));
const broadcast = (message) => {
  for (const id in peers) {
    peers[id].conn.write(message);
  }
};
const queryChainLengthMsg = () => ({
  type: MessageType.QUERY_LATEST,
  data: null,
});
const queryAllMsg = () => ({ type: MessageType.QUERY_ALL, data: null });
const responseChainMsg = () => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify(blockchain_1.getBlockchain()),
});
const responseLatestMsg = () => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify([blockchain_1.getLatestBlock()]),
});
const queryTransactionPoolMsg = () => ({
  type: MessageType.QUERY_TRANSACTION_POOL,
  data: null,
});
const responseTransactionPoolMsg = () => ({
  type: MessageType.RESPONSE_TRANSACTION_POOL,
  data: JSON.stringify(transactionPool_1.getTransactionPool()),
});
const initErrorHandler = (conn, peerId, seq) => {
  conn.on('close', () => {
    if (peers[peerId].seq === seq) {
      console.log(`peer exited: ${JSON.stringify(peers[peerId].seq)}`);
      delete peers[peerId];
    }
  });
};
const handleBlockchainResponse = (receivedBlocks) => {
  if (receivedBlocks.length === 0) {
    console.log('received block chain size of 0');
    return;
  }
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  if (!blockchain_1.isValidBlockStructure(latestBlockReceived)) {
    console.log('block structuture not valid');
    return;
  }
  const latestBlockHeld = blockchain_1.getLatestBlock();
  if (latestBlockReceived.index > latestBlockHeld.index) {
    console.log(
      `blockchain possibly behind. We got: ${
        latestBlockHeld.index
      } Peer got: ${
        latestBlockReceived.index}`,
    );
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      if (blockchain_1.addBlockToChain(latestBlockReceived)) {
        broadcast(responseLatestMsg());
      }
    } else if (receivedBlocks.length === 1) {
      console.log('We have to query the chain from our peer');
      broadcast(queryAllMsg());
    } else {
      console.log('Received blockchain is longer than current blockchain');
      blockchain_1.replaceChain(receivedBlocks);
    }
  } else {
    console.log(
      'received blockchain is not longer than received blockchain. Do nothing',
    );
  }
};
const broadcastLatest = () => {
  broadcast(responseLatestMsg());
};
exports.broadcastLatest = broadcastLatest;
const broadCastTransactionPool = () => {
  broadcast(responseTransactionPoolMsg());
};
exports.broadCastTransactionPool = broadCastTransactionPool;
