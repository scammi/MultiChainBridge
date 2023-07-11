const hre = require("hardhat")
const { sourceChainConfig } = require("../config.js")
const fs = require("fs")

const ethers = hre.ethers

const deployed = JSON.parse(fs.readFileSync("./deployed.json"))

let sourceSigner, sourceAddress, sourceNFT

const getSigners = async () => {
    const sourceProvider = new ethers.providers.JsonRpcProvider(sourceChainConfig.rpcUrl)
    const sourceWallet = ethers.Wallet.fromMnemonic(process.env.TESTNET_MNEMONIC ?? '');
    sourceSigner = sourceWallet.connect(sourceProvider)
    sourceAddress = await sourceSigner.getAddress()
}

const mintSrcNft = async () => {
    await getSigners()
    sourceNFT = await ethers.getContractFactory("NFT", sourceSigner)
    const sourceChainNft = sourceNFT.attach(deployed.sourceChain.nft)
    const mintSourceNft = await sourceChainNft.mint(
        sourceAddress, "abc",
        {
            gasLimit: 15000000,
            gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
        }
    )
    console.log(mintSourceNft)
    await mintSourceNft.wait()
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