const Axios = require("axios");
const readlineSync = require("readline-sync");
const pc_p2p = require("./pc_p2p");
const getPort = require("get-port");

const menu =
  "1. Get Balance\n2. Get address\n3. Get Blocks\n4. Get Peers\n5. Get Block of a hash\n" +
  "6. Get unspentTransactionOutputs\n7. Get myUnspentTransactionOutputs\n8. transactionPool\n" +
  "9. send Transaction\n10. Mine Block\n11. Make an inter-network communication\n>12. Leave powerchain channel\n>";
// 16 APIs
const port = process.argv[2];
let response;
const askUser = async () => {
  const choice = readlineSync.question(menu);
  switch (parseInt(choice)) {
    case 1:
      try {
        response = await Axios.get(`http://localhost:${port}/balance`);
        console.log(response.data);
      } catch (e) {
        console.log("Error fetching balance");
      }
      break;

    case 2:
      try {
        response = await Axios.get(`http://localhost:${port}/address`);
        console.log(response.data);
      } catch (e) {
        console.log("Error fetching address");
      }
      break;

    case 3:
      try {
        response = await Axios.get(`http://localhost:${port}/blocks`);
        console.log(response.data);
      } catch (e) {
        console.log("Error fetching blocks");
      }
      break;

    case 4:
      try {
        response = await Axios.get(`http://localhost:${port}/peers`);
        console.log(response.data);
      } catch (e) {
        console.log("Error fetching peers");
      }
      break;

    case 5:
      try {
        const hash = readlineSync.question("Enter Hash\n>");
        response = await Axios.get(`http://localhost:${port}/block/${hash}`);
        console.log(response.data);
      } catch (e) {
        console.log("Error fetching block");
      }
      break;

    case 6:
      try {
        response = await Axios.get(
          `http://localhost:${port}/unspentTransactionOutputs`
        );
        console.log(response.data);
      } catch (e) {
        console.log("Error fetching unspent transactions");
      }
      break;

    case 7:
      try {
        response = await Axios.get(
          `http://localhost:${port}/myUnspentTransactionOutputs`
        );
        console.log(response.data);
      } catch (e) {
        console.log("Error fetching my unspent transactions");
      }
      break;

    case 8:
      try {
        response = await Axios.get(`http://localhost:${port}/transactionPool`);
        console.log(response.data);
      } catch (e) {
        console.log("Error fetching transaction pool");
      }
      break;

    case 9:
      try {
        const address = readlineSync.question("Enter Address\n>");
        const amount = readlineSync.question("Enter Amount\n>");
        response = await Axios.post(
          `http://localhost:${port}/sendTransaction`,
          {
            address,
            amount: parseInt(amount)
          }
        );
        console.log(response.data);
      } catch (e) {
        console.log("Error sending transaction");
      }
      break;

    case 10:
      try {
        response = await Axios.post(`http://localhost:${port}/mineBlock`);
        console.log(response.data);
      } catch (e) {
        console.log("Error mining block");
      }
      break;

    case 11:
      try {
        const channel = readlineSync.question("Enter Channel Name\n>");
        const add = readlineSync.question("Enter Address\n>");
        const amont = readlineSync.question("Enter Amount\n>");
        response = await Axios.post(
          `http://localhost:${port}/sendInternetworkTransaction`,
          {
            address: add,
            amount: parseInt(amont),
            channel
          }
        );
        console.log(response.data);
      } catch (e) {
        console.log("Error sending internetwork transaction");
      }
      break;

    case 12:
      pc_p2p.exitPC_P2P();
      break;
    default:
      console.log("Not a Valid Input");
  }
  askUser();
};

askUser();
