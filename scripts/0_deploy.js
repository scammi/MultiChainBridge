const hre = require("hardhat")
const { sourceChainConfig, destinationChainConfig } = require("../config.js")
const dotenv = require("dotenv")
const fs = require("fs")
const deployed = require("../deployed.json")

const ethers = hre.ethers

dotenv.config()

let sourceSigner, destinationSigner
let sourceNFT, destinationNFT, GatewayLILO, GatewayMintBurn
let sourceChainNft, destinationChainNft, gatewayLilo, gatewayMintBurn

const sourceNFTAddress = deployed.sourceChain.nft;
const destinationNFTAddress = deployed.destinationChain.nft;
const gatewayMintBurnAddress = deployed.destinationChain.gateway;
const gatewayLiloAddress = deployed.sourceChain.gateway;

const deploySrcNft = async () => {
    if (sourceNFTAddress) {
        sourceChainNft = sourceNFT.attach(sourceNFTAddress)
    } else {
        sourceChainNft = await sourceNFT.deploy(
            "Source Chain NFT", "SRC_NFT",
            { gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei")
        })
        await sourceChainNft.deployed()
    }

    console.log(`Source NFT deployed on ${ sourceChainConfig.name } at: ${ sourceChainNft.address }`)
}

const deployDestNft = async () => {
    if (destinationNFTAddress) {
        destinationChainNft = destinationNFT.attach(destinationNFTAddress)
    } else {
        destinationChainNft = await destinationNFT.deploy(
            "Destination Chain NFT", "DEST_NFT",
            { gasLimit: 15000000, gasPrice: ethers.utils.parseUnits(destinationChainConfig.gasPrice, "gwei")
        });
        await destinationChainNft.deployed()
    }
    console.log(`Destination NFT deployed on ${ destinationChainConfig.name } at: ${ destinationChainNft.address }`)
}

const deploySrcGateway = async () => {
    if (gatewayLiloAddress) {
        gatewayLilo = GatewayLILO.attach(gatewayLiloAddress);
    } else {
        gatewayLilo = await GatewayLILO.deploy(
            sourceChainConfig.anyCallProxy, 2, sourceNFTAddress,
            {
                gasLimit: 15000000,
                gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
                nonce: 41 
            }
        )
        await gatewayLilo.deployed()
    }
    console.log(`Source gateway deployed on ${ sourceChainConfig.name } at: ${ gatewayLilo.address }`)
}

const deployDestGateway = async () => {
    if (gatewayMintBurnAddress) {
        gatewayMintBurn = await GatewayMintBurn.attach(gatewayMintBurnAddress);
    } else {
        gatewayMintBurn = await GatewayMintBurn.deploy(
            destinationChainConfig.anyCallProxy, 2, destinationChainNft.address,
            { gasLimit: 15000000, gasPrice: ethers.utils.parseUnits(destinationChainConfig.gasPrice, "gwei")
        })
        await gatewayMintBurn.deployed()
    }
    console.log(`Destination gateway deployed on ${ destinationChainConfig.name } at: ${ gatewayMintBurnAddress }`)
}

const setSrcPeer = async () => {
    const setSrcPeersTx = await gatewayLilo.setPeers(
        [ destinationChainConfig.chainId ], [ gatewayMintBurnAddress ],
        {
            gasLimit: 15000000,
            gasPrice: ethers.utils.parseUnits(sourceChainConfig.gasPrice, "gwei"),
            nonce: 45
        }
    )
    await setSrcPeersTx.wait()
    console.log(`Set source chain peer to ${ gatewayMintBurnAddress }`)
}

const setDestPeer = async () => {
    const setDestPeersTx = await gatewayMintBurn.setPeers(
        [ sourceChainConfig.chainId ], [ gatewayLiloAddress ],
        { gasLimit: 15000000, gasPrice: ethers.utils.parseUnits(destinationChainConfig.gasPrice, "gwei")
    })
    console.log(setDestPeersTx);
    await setDestPeersTx.wait()
    console.log(`Set destination chain peer to ${ gatewayLilo.address }`)
}

const setMinter = async () => {
    const setMinterTx = await destinationChainNft.transferOwnership(
        gatewayMintBurnAddress,
        { gasLimit: 15000000, gasPrice: ethers.utils.parseUnits(destinationChainConfig.gasPrice, "gwei")
    })
    await setMinterTx.wait()
    console.log(`Set minter to ${ gatewayMintBurnAddress } on destination chain ${ destinationChainConfig.name }`)
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
    } catch(err) {
        console.log(`error in get signers`)
    }

    sourceNFT = await ethers.getContractFactory("NFT", sourceSigner)
    destinationNFT = await ethers.getContractFactory("NFT", destinationSigner)
    GatewayLILO = await ethers.getContractFactory("ERC721Gateway_LILO", sourceSigner)
    GatewayMintBurn = await ethers.getContractFactory("ERC721Gateway_MintBurn", destinationSigner)

    try {
        await deploySrcNft()
    } catch(err) {
        console.log(`error in deploy src nft: ${ err.message }`)
    }

    try {
        await deployDestNft()
    } catch(err) {
        console.log(`error in deploy dest nft: ${ err.message }`)
    }

    try {
        await deploySrcGateway()
    } catch(err) {
        console.log(`error in deploy src gateway: ${ err.message }`)
    }

    try {
        await deployDestGateway()
    } catch(err) {
        console.log(`error in deploy dest gateway: ${ err.message }`)
    }

    try {
        await setSrcPeer()
    } catch(err) {
        console.log(`error in set src peer: ${ err.message }`)
    }

    try {
        await setDestPeer()
    } catch(err) {
        console.log(`error in set dest peer: ${ err.message }`)
    }

    try {
        await setMinter()
    } catch(err) {
        console.log(`error in set minter: ${ err.message }`)
    }
}

main()
.then(() => {
    fs.writeFileSync("./deployed.json", JSON.stringify({ sourceChain: { chainId: sourceChainConfig.chainId, nft: sourceChainNft.address, gateway: gatewayLilo.address }, destinationChain: { chainId: destinationChainConfig.chainId, nft: destinationChainNft.address, gateway: gatewayMintBurn.address }}, null, 4))
    console.log(`Success.`)
    process.exitCode = 0
})
.catch((err) => {
    console.error(err.message)
    process.exitCode = 1
})