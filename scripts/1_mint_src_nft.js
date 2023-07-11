const hre = require("hardhat")
const { sourceChainConfig } = require("../config.js")
const { getContracts, getSigners } = require("./utils.js")

const ethers = hre.ethers

const mintSrcNft = async () => {
  const { sourceNFT } = await getContracts()
  const { sourceSigner } = getSigners()

  const destinationMintAddress =  await sourceSigner.getAddress();

  const mintSourceNftSimulation = await sourceNFT.callStatic.mint(destinationMintAddress, "abc")
  console.log("Minted token ID >", mintSourceNftSimulation)

  const mintSourceNft = await sourceNFT.mint(
    destinationMintAddress, "abc",
    {
      gasLimit: 15000000,
      gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
    }
  )
  const mintReceipt = await mintSourceNft.wait()
  console.log('Transaction mint at hash >', mintReceipt.transactionHash)
}

mintSrcNft()
  .then(() => {
    console.log(`Success.`)
    process.exitCode = 0
  })
  .catch((err) => {
    console.error(err.message)
    process.exitCode = 1
  })