const Axios = require('axios');
const readlineSync = require('readline-sync');
const pc_p2p = require('./pc_p2p');
const getPort = require("get-port");

const menu = '1. Get Balance\n2. Get address\n3. Get Blocks\n4. Get Peers\n5. Get Block of a hash\n'
             + '6. Get unspentTransactionOutputs\n7. Get myUnspentTransactionOutputs\n8. transactionPool\n'
             + '9. send Transaction\n10. Mine Block\n11. Make an inter-network communication\n>12. Leave powerchain channel\n>';
// 16 APIs
const port = process.argv[2];
let response;
const askUser = async () => {
  const choice = readlineSync.question(
    menu,
  );
  switch (parseInt(choice)) {
    case 1: response = await Axios.get(`http://localhost:${port}/balance`);
            console.log(response.data);
            break;

    case 2: response = await Axios.get(`http://localhost:${port}/address`);
            console.log(response.data);
            break;

    case 3: response = await Axios.get(`http://localhost:${port}/blocks`);
            console.log(response.data);
            break;

    case 4: response = await Axios.get(`http://localhost:${port}/peers`);
            console.log(response.data);
            break;

    case 5: const hash = readlineSync.question('Enter Hash\n>');
            response = await Axios.get(`http://localhost:${port}/block/${hash}`);
            console.log(response.data);
            break;

    case 6: response = await Axios.get(`http://localhost:${port}/unspentTransactionOutputs`);
            console.log(response.data);
            break;

    case 7: response = await Axios.get(`http://localhost:${port}/myUnspentTransactionOutputs`);
            console.log(response.data);
            break;

    case 8: response = await Axios.get(`http://localhost:${port}/transactionPool`);
            console.log(response.data);
            break;

    case 9: const address = readlineSync.question('Enter Address\n>');
            const amount = readlineSync.question('Enter Amount\n>');
            response = await Axios.post(`http://localhost:${port}/sendTransaction`, {
              address,
              amount: parseInt(amount),
            });
            console.log(response.data);
            break;

    case 10:  response = await Axios.post(`http://localhost:${port}/mineBlock`);
              console.log(response.data);
              break;

    case 11:  const portForPc = await getPort();
              pc_p2p.init_PC_P2PServer(portForPc);
              const channel = readlineSync.question('Enter Channel Name\n>');
              const add = readlineSync.question('Enter Address\n>');
              const amont = readlineSync.question('Enter Amount\n>');
              response = await Axios.post(`http://localhost:${port}/sendTransaction`, {
                address: add,
                amount: parseInt(amont),
                channel,
              });
              pc_p2p.sendInterNetworktx(response);
              setTimeout(() => {
                pc_p2p.exitPC_P2P();
              },1000);
              break;
    case 12:  pc_p2p.exitPC_P2P();
              break;
    default: console.log('Not a Valid Input');
  }
  askUser();
};

askUser();
