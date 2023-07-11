const hre = require("hardhat")
const { sourceChainConfig, destinationChainConfig } = require("../config.js")
const deployed = require("../deployed.json")
const { getSigners } = require("./utils.js")
const ethers = hre.ethers

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

const setMinter = async () => {
  const setMinterTx = await DestinationNFT.attach(destinationNFTAddress).transferOwnership(
    gatewaySource.address ?? gatewayDestinationAddress,
    {
      gasLimit: 15000000,
      gasPrice: destinationChainGasPriceParsed
    }
  )
  await setMinterTx.wait()
  console.log(`Set minter to ${gatewaySource.address ?? gatewayDestinationAddress} on destination chain ${destinationChainConfig.name}`)
}

const main = async () => {
  const { sourceSigner, destinationSigner } = getSigners()

  SourceNFT = await ethers.getContractFactory("NFT", sourceSigner)
  DestinationNFT = await ethers.getContractFactory("DestinationNFT", destinationSigner)
  GatewaySource = await ethers.getContractFactory("ERC721GatewaySource", sourceSigner)
  GatewayDestination = await ethers.getContractFactory("ERC721GatewayDestination", destinationSigner)

  try {
    await deploySrcNft()
  } catch (err) {
    console.log(`error in deploy src nft: ${err.message}`)
  }

  try {
    await deployDestNft()
  } catch (err) {
    console.log(`error in deploy dest nft: ${err.message}`)
  }

  try {
    await deploySrcGateway()
  } catch (err) {
    console.log(`error in deploy src gateway: ${err.message}`)
  }

  try {
    await deployDestGateway()
  } catch (err) {
    console.log(`error in deploy dest gateway: ${err.message}`)
  }

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