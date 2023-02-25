import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constant.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const ethAmount = document.getElementById("ethAmount");

fundButton.addEventListener("click", () => {
  // perform the fund operation here
  ethAmount = ethAmount.value;
  // clear the input field
  ethAmount.value = "";
});

connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
balanceButton.addEventListener("click", getBalance);
withdrawButton.addEventListener("click", withdraw);

// Check localStorage for wallet connection flag
const connectedToWallet = localStorage.getItem("connectedToWallet");

if (connectedToWallet) {
  // If connected, update button text and disable connect button
  connectButton.innerHTML = "Connected";
  connectButton.disabled = true;
}

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length === 0) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
    }

    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install metamask";
  }
}

async function fund() {
  const amount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(amount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done");
      document.getElementById("ethAmount").value = "";
    } catch (error) {
      console.log(error);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    const formattedBalance = ethers.utils.formatEther(balance);

    // Show balance for 3 seconds
    balanceButton.innerHTML = ` ${formattedBalance} ETH`;
    setTimeout(() => {
      balanceButton.innerHTML = "Balance";
    }, 3000);
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}....`);

  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReciept) => {
      console.log(
        `Completed with ${transactionReciept.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  }
}
