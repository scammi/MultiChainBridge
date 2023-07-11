const hre = require("hardhat")
const { destinationChainConfig } = require("../../config.js")
const { getContracts } = require("../utils")

const ethers = hre.ethers

const main = async () => {
  const { sourceNFT, gatewaySource, gatewayDestination} = await getContracts();

  // Listen to the SwapOut event on Polygon
  gatewaySource.on('SwapOut', (tokenId, sender, receiver, destChainID, swapoutSeq, peer) => {
    bridgeToDestination(tokenId, sender, receiver, destChainID, swapoutSeq, peer);

    console.log('SwapOut event caught:', tokenId, sender, receiver, destChainID);
  });

  console.log('Listening for events on Polygon chain...');

  // Function to call on the Avax chain and save event data to an object
  const bridgeToDestination = async (tokenId, sender, receiver, destChainID, swapoutSeq, peer) => {
    const originalUri = await sourceNFT.callStatic.tokenURI(tokenId);
    const mintTx = await gatewayDestination.Swapin(tokenId, receiver, originalUri, {
      gasLimit: 15000000,
      gasPrice: ethers.utils.parseUnits(destinationChainConfig.gasPrice, "gwei")
    });
    const receipt = await mintTx.wait();
    console.log(receipt?.transactionHash);
  }
};

main();