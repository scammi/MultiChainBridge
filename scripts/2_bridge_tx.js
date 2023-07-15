const fs = require("fs")
const hre = require("hardhat")
const ethers = hre.ethers
const deployed = JSON.parse(fs.readFileSync("./deployed.json"))
const { getContracts } = require("./utils")
const { sourceChainConfig } = require("../config.js")

const tokenId = 19; // The NFT token to be bridge.
const destinationMintAddress = '0x277BFc4a8dc79a9F194AD4a83468484046FAFD3A';

const grantNFTApprovalToSourceGateway = async (tokenId) => {
  const { sourceNFT } = await getContracts()

  const approveTx = await sourceNFT.approve(
    deployed.sourceChain.gateway,
    tokenId,
    {
      gasLimit: 15000000,
      gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
    }
  )

  console.log(`Gateway approved usage of NFT ${tokenId}`)
  await approveTx.wait()
}

const enterTheGateway = async (tokenId) => {
  const { gatewaySource } = await getContracts()

  const anyCallTx = await gatewaySource.Swapout(
    ethers.BigNumber.from(String(tokenId)),
    destinationMintAddress,
    ethers.BigNumber.from("43114"),
    {
      gasLimit: 15000000,
      gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
    }
  )
  console.log('Entering the void .... ')
  const swapoutReceipt = await anyCallTx.wait()

  console.log('Locked token at hash > ', swapoutReceipt.transactionHash)
}

try {
  (async () => {
    await grantNFTApprovalToSourceGateway(tokenId)
    await enterTheGateway(tokenId)

    console.log(`Success.`)
    process.exitCode = 0
  })()

} catch (err) {
  console.error(err.message)
  process.exitCode = 1
}