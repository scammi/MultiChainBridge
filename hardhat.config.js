const dotenv = require("dotenv")
dotenv.config()

require("@nomicfoundation/hardhat-toolbox")

const RPC_URL_SRC = process.env.RPC_URL_SRC
const RPC_URL_DEST = process.env.RPC_URL_DEST
const mnemonic =  `${process.env.TESTNET_MNEMONIC}`.replace(/_/g, ' ');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.17",
    networks: {
        sourceChainConfig: {
            url: RPC_URL_SRC,
            chainId: 137,
            mnemonic: mnemonic
        },
        destinationChainConfig: {
            url: RPC_URL_DEST,
            chainId: 43114,
            mnemonic: mnemonic
        }
    }
}