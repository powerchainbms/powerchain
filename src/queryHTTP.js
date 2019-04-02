const Axios = require('axios')
var readlineSync = require("readline-sync");

const menu = '1. Get Balance\n2. Get address\n3. Get Blocks\n4. Get Peers\n5. Get Block of a hash\n' +
             '6. Get unspentTransactionOutputs\n7. Get myUnspentTransactionOutputs\n8. transactionPool\n' +
             '9. send Transaction\n>'
let r1
// 16 APIs
const port = process.argv[2]
let response
const askUser = async () => {
    const choice = readlineSync.question(
        menu
    );
    switch (parseInt(choice)) {
        case 1: response = await Axios.get('http://localhost:' + port + '/balance')
            console.log(response.data)
            break;

        case 2: response = await Axios.get('http://localhost:' + port + '/address')
            console.log(response.data)
            break;
        
        case 3: response = await Axios.get('http://localhost:' + port + '/blocks')
            console.log(response.data)
            break;

        case 4: response = await Axios.get('http://localhost:' + port + '/peers')
            console.log(response.data)
            break;

        case 5: const hash = readlineSync.question('Enter Hash\n>')
                response = await Axios.get('http://localhost:' + port + '/block/' + hash)
            console.log(response.data)
            break;

        case 6: response = await Axios.get('http://localhost:' + port + '/unspentTransactionOutputs')
            console.log(response.data)
            break;

        case 7: response = await Axios.get('http://localhost:' + port + '/myUnspentTransactionOutputs')
            console.log(response.data)
            break;

        case 8: response = await Axios.get('http://localhost:' + port + '/transactionPool')
            console.log(response.data)
            break;

        case 9: const address = readlineSync.question('Enter Address\n>')
                const amount = readlineSync.question('Enter Amount\n>')
                response = await Axios.post('http://localhost:' + port + '/sendTransaction', {
                    address,
                    amount: parseInt(amount)
                })
            console.log(response.data)
            break;

        default: console.log('Not a Valid Input')        
    }
    askUser()
}

askUser()