const Axios = require('axios')
const readline = require('readline')

const menu = '1. Get Balance\n2. Get address\n3. Get Blocks\n4. Get Peers\n5. Get Block of a hash\n' +
             '6. Get unspentTransactionOutputs\n7. Get myUnspentTransactionOutputs\n8. transactionPool\n' +
             '9. send Transaction'
let r1
// 16 APIs
const port = process.argv[2]
const askUser = async () => {

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question(menu, async number => {
        if(number == 1){
            const response = await Axios.get('http://localhost:' + port + '/balance')
            console.log(response.data)
            rl.close()
            askUser()
        }
        if (number == 2) {
            const response = await Axios.get('http://localhost:' + port + '/address')
            console.log(response.data)
            rl.close()
            askUser()
        }
        if (number == 3) {
            const response = await Axios.get('http://localhost:' + port + '/blocks')
            console.log(response.data)
            rl.close()
            askUser()
        }
        if (number == 4) {
            const response = await Axios.get('http://localhost:' + port + '/peers')
            console.log(response.data)
            rl.close()
            askUser()
        }
        if (number == 5) {
            rl.close()
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })
            rl.question('Enter Hash', async hash => {
                const response = await Axios.get('http://localhost:' + port + '/block/' + hash)
                console.log(response.data)
                rl.close()
                askUser()
            })
        }
        if (number == 6) {
            const response = await Axios.get('http://localhost:' + port + '/unspentTransactionOutputs')
            console.log(response.data)
            rl.close()
            askUser()
        }
        if (number == 7) {
            const response = await Axios.get('http://localhost:' + port + '/myUnspentTransactionOutputs')
            console.log(response.data)
            rl.close()
            askUser()
        }
        if (number == 8) {
            const response = await Axios.get('http://localhost:' + port + '/transactionPool')
            console.log(response.data)
            rl.close()
            askUser()
        }
        if (number == 9) {
            rl.close()
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })
            rl.question('Enter Address', async address => {
                rl.close()
                rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                })
                rl.question('Enter Amount', async amount => {
                    const response = await Axios.post('http://localhost:' + port + '/sendTransaction', {
                        address,
                        amount:parseInt(amount)
                    })
                    console.log(response.data)
                    rl.close()
                    askUser()
                })
            })
        }
    });
}
askUser()