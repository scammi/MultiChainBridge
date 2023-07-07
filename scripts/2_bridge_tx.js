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
    // const destinationProvider = new ethers.providers.JsonRpcProvider(destinationChainConfig.rpcUrl)
    // const destinationWallet = new ethers.Wallet(process.env.PK)
    sourceSigner = sourceWallet.connect(sourceProvider)
    // destinationSigner = destinationWallet.connect(destinationProvider)
    sourceAddress = await sourceSigner.getAddress()
}

const bridgeTx = async () => {
    await getSigners()
    const GatewayLILO = await ethers.getContractFactory("ERC721Gateway_LILO", sourceSigner)
    const gatewayLilo = GatewayLILO.attach(deployed.sourceChain.gateway)
    const anyCallTx = await gatewayLilo.callStatic.Swapout_no_fallback(ethers.BigNumber.from("0"), sourceAddress, ethers.BigNumber.from("97"), { value: ethers.BigNumber.from("3"), gasLimit: 1000000 })
    // await anyCallTx.wait()
    console.log(anyCallTx)
}

bridgeTx()
.then(() => {
    console.log(`Success.`)
    process.exitCode = 0
})
.catch((err) => {
    console.error(err.message)
    process.exitCode = 1
})