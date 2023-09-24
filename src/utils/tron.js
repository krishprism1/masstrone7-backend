const TronWeb = require('tronweb')

const fullNode = 'https://api.shasta.trongrid.io'; // Shasta full node URL
const solidityNode = 'https://api.shasta.trongrid.io'; // Shasta solidity node URL
const eventServer = 'https://api.shasta.trongrid.io'; // Shasta event server URL
const apiKey = "c3e64602-27ce-4add-9a23-b8aef9fa2e59"

const tronWeb = new TronWeb({
    fullHost: fullNode,
    headers: { "TRON-PRO-API-KEY": apiKey }
})


module.exports = {tronWeb}