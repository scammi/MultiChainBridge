const { sourceChainConfig, destinationChainConfig } = require("../config.js")
const deployed = require("../deployed.json")
const hre = require("hardhat")
const ethers = hre.ethers

const getSigners = () => {
  const sourceProvider = new ethers.providers.JsonRpcProvider(sourceChainConfig.rpcUrl)
  const sourceWallet = ethers.Wallet.fromMnemonic(process.env.TESTNET_MNEMONIC ?? '');
  const destinationProvider = new ethers.providers.JsonRpcProvider(destinationChainConfig.rpcUrl)
  const destinationWallet = ethers.Wallet.fromMnemonic(process.env.TESTNET_MNEMONIC ?? '');
  const sourceSigner = sourceWallet.connect(sourceProvider)
  const destinationSigner = destinationWallet.connect(destinationProvider)

  return {
    sourceSigner,
    destinationSigner
  }
}

const getContracts = async () => {
  const { sourceSigner, destinationSigner } = getSigners()

  const gatewaySourceAddress = deployed.sourceChain.gateway
  const gatewayDestinationAddress = deployed.destinationChain.gateway;
  const NFTSourceAddress = deployed.sourceChain.nft;
  const NFTDestinationAddress = deployed.destinationChain.nft;

  return {
    sourceNFT: (await ethers.getContractFactory("NFT", sourceSigner)).attach(NFTSourceAddress),
    destinationNFT:  (await ethers.getContractFactory("DestinationNFT", destinationSigner)).attach(NFTDestinationAddress),
    gatewaySource:  (await ethers.getContractFactory("ERC721GatewaySource", sourceSigner)).attach(gatewaySourceAddress),
    gatewayDestination:  (await ethers.getContractFactory("ERC721GatewayDestination", destinationSigner)).attach(gatewayDestinationAddress)
  }
}

module.exports = { getSigners, getContracts }