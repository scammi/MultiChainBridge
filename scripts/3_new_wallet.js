const hre = require("hardhat")
const ethers = hre.ethers


const newWallet = async () => {
  const newWallet = ethers.Wallet.createRandom();
  console.log(newWallet, newWallet.mnemonic);
};

newWallet()
.then(() => {
    console.log(`Success.`)
    process.exitCode = 0
})
.catch((err) => {
    console.error(err.message)
    process.exitCode = 1
})