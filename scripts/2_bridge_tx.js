const hre = require("hardhat")
const { sourceChainConfig, destinationChainConfig } = require("../config.js")
const dotenv = require("dotenv")
const fs = require("fs")

const ethers = hre.ethers

dotenv.config()

const deployed = JSON.parse(fs.readFileSync("./deployed.json"))

let sourceProvider, sourceSigner, sourceAddress

const getSigners = async () => {
    sourceProvider = new ethers.providers.JsonRpcProvider(sourceChainConfig.rpcUrl)
    const sourceWallet = ethers.Wallet.fromMnemonic(process.env.TESTNET_MNEMONIC ?? '');
    sourceSigner = sourceWallet.connect(sourceProvider)
    sourceAddress = await sourceSigner.getAddress()
}

const allowContractToUseNftTx = async () => {
    await getSigners()
    const sourceNFT = (await ethers.getContractFactory("NFT", sourceSigner)).attach(deployed.sourceChain.nft)

    const approveTx = await sourceNFT.approve(
        deployed.sourceChain.gateway,
        0, 
        {
            gasLimit: 15000000,
            gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
        }
    )
    console.log(approveTx)
    await approveTx.wait()
}

const bridgeTx = async () => {
    await getSigners()
    const GatewayLILO = await ethers.getContractFactory("ERC721GatewaySource", sourceSigner)
    const gatewayLilo = GatewayLILO.attach(deployed.sourceChain.gateway)
    const anyCallTx = await gatewayLilo.Swapout(
        ethers.BigNumber.from("0"),
        sourceAddress,
        ethers.BigNumber.from("43114"),
        {
            // value: ethers.BigNumber.from("2256000000000000000"),
            gasLimit: 15000000,
            gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
        }
    )
    console.log(anyCallTx)
    await anyCallTx.wait()
}

await allowContractToUseNftTx();

bridgeTx()
.then(() => {
    console.log(`Success.`)
    process.exitCode = 0
})
.catch((err) => {
    console.error(err.message)
    process.exitCode = 1
})