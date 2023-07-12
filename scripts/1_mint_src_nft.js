const hre = require("hardhat")
const { sourceChainConfig } = require("../config.js")
const { getContracts, getSigners } = require("./utils.js")

const ethers = hre.ethers


const mintSourceNFT = async () => {
  const { sourceNFT } = await getContracts()
  const { sourceSigner } = getSigners()

  const destinationMintAddress =  await sourceSigner.getAddress();

  const mintSourceNftId = await sourceNFT.callStatic.mint(destinationMintAddress, "abc")
  console.log("- Minted token ID > ", mintSourceNftId)

  const mintSourceNft = await sourceNFT.mint(
    destinationMintAddress, "abc",
    {
      gasLimit: 15000000,
      gasPrice: sourceChainConfig.gasPriceWUIParsed,
    }
  )

  const mintReceipt = await mintSourceNft.wait()
  console.log('- Transaction mint at hash >', mintReceipt.transactionHash)

  return mintSourceNftId
}

const createAccount = async (tokenId) => {
  const { registrySource, sourceNFT } = await getContracts();
  const sourceTokenAddress = sourceNFT.address;

  const createAccountTrx = await registrySource.createAccount(
    sourceChainConfig.accountImplementationAddress,
    sourceChainConfig.chainId,
    sourceTokenAddress,
    tokenId,
    0,
    '0x',
    {
      gasLimit: 15000000,
      gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
    }
  )
  const createAccountReceipt = await createAccountTrx.wait()
  console.log("- Account created at hash > ", createAccountReceipt.transactionHash)

  const accountCreated = await registrySource.callStatic.account(
    sourceChainConfig.accountImplementationAddress,
    sourceChainConfig.chainId,
    sourceTokenAddress,
    tokenId,
    0,
  )

  console.log('- New account > ', accountCreated)
  return accountCreated
}

try {
  (async () => {
    const mintedId = await mintSourceNFT()
    const createdAccount = await createAccount(mintedId)
    // todo found account
  
    console.log(`Success.`)
    process.exitCode = 0
  })()

} catch(err) {
  console.error(err.message)
  process.exitCode = 1
}
