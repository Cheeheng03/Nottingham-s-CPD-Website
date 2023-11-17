import React, { useState } from 'react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';


const NOTTAddress = '0x1E7E178b707F90139CF8b8c99c558AEA99e3f564';
const NOTTAbi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint amount)',
];

function Claim() {
  const [balanceInEther, setBalanceInEther] = useState('');

  async function getBalance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const balance = await signer.getBalance();
    const convertToEth = ethers.utils.formatUnits(balance, 18);
    setBalanceInEther(convertToEth);
  }

  async function readDataFromSmartContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const usdtContract = new ethers.Contract(NOTTAddress, NOTTAbi, provider);
    const name = await usdtContract.name();
    const symbol = await usdtContract.symbol();
    const decimals = await usdtContract.decimals();
    const totalSupply = await usdtContract.totalSupply();
    const myBalance = await usdtContract.balanceOf("0x2Ffd02772a9A33D73aD16908dF16900AD1326f3E");

    alert(
        `name = ${name}\n` +
        `symbol = ${symbol}\n` +
        `decimals = ${decimals}\n` +
        `totalSupply = ${totalSupply / 1e18}\n` +
        `myBalance = ${myBalance / 1e18}`
    );
}

async function claimTokens() {
    const numberOfTokensToClaim = 5;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const ContractAbi = ["function claimTokens(uint256 numberOfTokens) external"];
    const usdtContract = new ethers.Contract(NOTTAddress, ContractAbi, signer);

    try {
        // Call the claimTokens function with the specified number of tokens.
        const txResponse = await usdtContract.claimTokens(numberOfTokensToClaim);
        await txResponse.wait();
        alert(`Claimed ${numberOfTokensToClaim} tokens successfully.`);
    } catch (error) {
        console.error(error);
        alert("Failed to claim tokens. Please check your eligibility.");
    }
}

  return (
    <div>
      <Navbar />
      <div className="p-4">
      <button
        className="bg-[#002D74] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
        onClick={getBalance}
      >
        Get Balance
      </button>

      <button
        className="bg-[#002D74] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
        onClick={readDataFromSmartContract}
      >
        Read Data from Smart Contract
      </button>
    </div>

      <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Claim Tokens</h2>
      <button
        className="bg-[#002D74] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={claimTokens}
      >
        Claim Tokens
      </button>
    </div>

    </div>
  );
}

export default Claim;