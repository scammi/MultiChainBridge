module.exports = {
    sourceChainConfig: {
        name: "MATIC",
        chainId: 137,
        rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/HFlv2m48GYEDLf9sHMTBuy2Z80xFwlVC",
        anyCallProxy: "0xC10Ef9F491C9B59f936957026020C321651ac078",
        gasPrice: '240'
        // anyCallProxy: "0xc629d02732EE932db1fa83E1fcF93aE34aBFc96B"
    },
    destinationChainConfig: {
        name: "Avalanche (C-Chain)",
        chainId: 43114,
        rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
        anyCallProxy: "0xC10Ef9F491C9B59f936957026020C321651ac078",
        gasPrice: '30'
        // anyCallProxy: "0xD2b88BA56891d43fB7c108F23FE6f92FEbD32045"
    }
}