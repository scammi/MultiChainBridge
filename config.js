module.exports = {
  sourceChainConfig: {
    name: "MATIC",
    chainId: 137,
    rpcUrl: process.env.RPC_URL_SRC,
    gasPrice: '160',
    accountImplementationAddress: '0x2d25602551487c3f3354dd80d76d54383a243358'
  },
  destinationChainConfig: {
    name: "Avalanche (C-Chain)",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    gasPrice: '30'
  }
}