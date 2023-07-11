module.exports = {
    sourceChainConfig: {
        name: "MATIC",
        chainId: 137,
        rpcUrl: process.env.RPC_URL_SRC,
        gasPrice: '240'
    },
    destinationChainConfig: {
        name: "Avalanche (C-Chain)",
        chainId: 43114,
        rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
        gasPrice: '30'
    }
}