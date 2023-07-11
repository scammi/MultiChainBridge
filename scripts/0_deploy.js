const hre = require("hardhat")
const { sourceChainConfig, destinationChainConfig } = require("../config.js")
const dotenv = require("dotenv")
const fs = require("fs")
const deployed = require("../deployed.json")

const ethers = hre.ethers

dotenv.config()

let sourceSigner, destinationSigner
let SourceNFT, DestinationNFT, GatewaySource, GatewayDestination
let sourceChainNft, destinationChainNft, gatewaySource, gatewayDestination

const sourceNFTAddress = deployed.sourceChain.nft;
const destinationNFTAddress = deployed.destinationChain.nft;
const gatewayDestinationAddress = deployed.destinationChain.gateway;
const gatewaySourceAddress = deployed.sourceChain.gateway;

const sourceChainGasPriceParsed = ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei");
const destinationChainGasPriceParsed = ethers.utils.parseUnits(destinationChainConfig.gasPrice, "gwei");

const deploySrcNft = async () => {
  if (sourceNFTAddress) {
    sourceChainNft = SourceNFT.attach(sourceNFTAddress)
  } else {
    sourceChainNft = await SourceNFT.deploy(
      "Source Chain NFT", "SRC_NFT",
      {
        gasPrice: sourceChainGasPriceParsed
      }
    )
    await sourceChainNft.deployed()
  }

  console.log(`Source NFT deployed on ${sourceChainConfig.name} at: ${sourceChainNft?.address}`)
}

const deployDestNft = async () => {
  if (destinationNFTAddress) {
    destinationChainNft = DestinationNFT.attach(destinationNFTAddress)
  } else {
    destinationChainNft = await DestinationNFT.deploy(
      "Destination Chain NFT", "DEST_NFT",
      {
        gasLimit: 15000000, gasPrice: ethers.utils.parseUnits(destinationChainConfig.gasPrice, "gwei")
      });
    await destinationChainNft.deployed()
  }
  console.log(`Destination NFT deployed on ${destinationChainConfig.name} at: ${destinationChainNft?.address}`)
}

const deploySrcGateway = async () => {
  if (gatewaySourceAddress) {
    gatewaySource = GatewaySource.attach(gatewaySourceAddress);
  } else {
    gatewaySource = await GatewaySource.deploy(
      sourceNFTAddress,
      {
        gasLimit: 15000000,
        gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
      }
    )
    await gatewaySource.deployed()
  }
  console.log(`Source gateway deployed on ${sourceChainConfig.name} at: ${gatewaySource?.address}`)
}

const deployDestGateway = async () => {
  if (gatewayDestinationAddress) {
    gatewayDestination = await GatewayDestination.attach(gatewayDestinationAddress);
  } else {
    gatewayDestination = await GatewayDestination.deploy(
      destinationNFTAddress,
      {
        gasLimit: 15000000,
        gasPrice: destinationChainGasPriceParsed
      }
    )
    await gatewayDestination.deployed()
  }
  console.log(`Destination gateway deployed on ${destinationChainConfig.name} at: ${gatewayDestination.address}`)
}

const setSrcPeer = async () => {
  const setSrcPeersTx = await GatewaySource.attach(gatewaySourceAddress).setPeers(
    [destinationChainConfig.chainId], [gatewayDestinationAddress],
    {
      gasLimit: 15000000,
      gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
      nonce: 53
    }
  )
  await setSrcPeersTx.wait()
  console.log(`Set source chain peer to ${gatewayDestinationAddress}`)
}

const setDestPeer = async () => {
  const setDestPeersTx = await GatewayDestination.attach(gatewayDestinationAddress).setPeers(
    [sourceChainConfig.chainId], [gatewaySourceAddress],
    {
      gasLimit: 15000000,
      gasPrice: destinationChainGasPriceParsed
    }
  )
  await setDestPeersTx.wait()
  console.log(`Set destination chain peer to ${gatewaySource?.address}`)
}

const setMinter = async () => {
  const setMinterTx = await DestinationNFT.attach(destinationNFTAddress).transferOwnership(
    gatewayDestinationAddress,
    {
      gasLimit: 15000000,
      gasPrice: destinationChainGasPriceParsed
    }
  )
  await setMinterTx.wait()
  console.log(`Set minter to ${gatewayDestinationAddress} on destination chain ${destinationChainConfig.name}`)
}

const getSigners = () => {
  const sourceProvider = new ethers.providers.JsonRpcProvider(sourceChainConfig.rpcUrl)
  const sourceWallet = ethers.Wallet.fromMnemonic(process.env.TESTNET_MNEMONIC ?? '');
  const destinationProvider = new ethers.providers.JsonRpcProvider(destinationChainConfig.rpcUrl)
  const destinationWallet = ethers.Wallet.fromMnemonic(process.env.TESTNET_MNEMONIC ?? '');
  sourceSigner = sourceWallet.connect(sourceProvider)
  destinationSigner = destinationWallet.connect(destinationProvider)
}

const main = async () => {
  try {
    getSigners()
  } catch (err) {
    console.log(`error in get signers`)
  }

  SourceNFT = await ethers.getContractFactory("NFT", sourceSigner)
  DestinationNFT = await ethers.getContractFactory("NFT", destinationSigner)
  GatewaySource = await ethers.getContractFactory("ERC721GatewaySource", sourceSigner)
  GatewayDestination = await ethers.getContractFactory("ERC721GatewayDestination", destinationSigner)

  // try {
  //   await deploySrcNft()
  // } catch (err) {
  //   console.log(`error in deploy src nft: ${err.message}`)
  // }

  // try {
  //   await deployDestNft()
  // } catch (err) {
  //   console.log(`error in deploy dest nft: ${err.message}`)
  // }

  // try {
  //   await deploySrcGateway()
  // } catch (err) {
  //   console.log(`error in deploy src gateway: ${err.message}`)
  // }

  // try {
  //   await deployDestGateway()
  // } catch (err) {
  //   console.log(`error in deploy dest gateway: ${err.message}`)
  // }

  // try {
  //   await setSrcPeer()
  // } catch (err) {
  //   console.log(`error in set src peer: ${err.message}`)
  // }

  // try {
  //   await setDestPeer()
  // } catch (err) {
  //   console.log(`error in set dest peer: ${err.message}`)
  // }

  try {
    await setMinter()
  } catch (err) {
    console.log(`error in set minter: ${err.message}`)
  }
}

main()
  .then(() => {
    fs.writeFileSync("./deployed.json", JSON.stringify({
      sourceChain: {
        chainId: sourceChainConfig.chainId,
        nft: sourceChainNft.address ?? sourceNFTAddress,
        gateway: gatewaySource.address ?? gatewaySourceAddress
      },
      destinationChain: {
        chainId: destinationChainConfig.chainId,
        nft: destinationChainNft.address ?? destinationNFTAddress,
        gateway: gatewayDestination.address ?? gatewayDestinationAddress,
      }
    }, null, 4))
    console.log(`Success.`)
    process.exitCode = 0
  })
  .catch((err) => {
    console.error(err.message)
    process.exitCode = 1
  })