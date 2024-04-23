/*
 * Source code written by SEGP Group P
 * Website guide component for guiding users on using the Nottingham s-CPD website
 * External libraries used: react, ethers
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import Step1Logo from '../Images/step1.png';
import Step2Logo from '../Images/step2.png';
import Step3Logo from '../Images/step3.png';
import Step4Logo from '../Images/step4.png';

export default function WebsiteGuide () {
    // State to store signer's Ethereum address
    const [signerAddress, setSignerAddress] = useState('');
    // State to track component loading status
    const [isLoaded, setIsLoaded] = useState(false);
    // Ethereum provider setup
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Address of User of the governance body (change it to your wallet address if you want to access the functions of the governance body)
    const showGovernanceStep = signerAddress === '0x2Ffd02772a9A33D73aD16908dF16900AD1326f3E' || signerAddress === '0x0a7665c13953491c66A3313c1256c2800E5D9853' || signerAddress === '0x59BA804564A7dD67A2b29F319d9983414284c297' || signerAddress === '0xa504E86C89Cc27fE8422316293d00b4ef945E4De';
    // Ethereum token contract address
    const tokenContractAddress = '0xd4BCA3131b49613F069980B1026CC96202Cc2786';
    // State to track successful copying of contract address
    const [copySuccess, setCopySuccess] = useState(false);

    // Fetch signer's Ethereum address on component moun
    useEffect(() => {
        setIsLoaded(true);

		async function fetchSignerAddress() {
			try {
			  const signer = provider.getSigner();
			  const address = await signer.getAddress();
			  setSignerAddress(address);
			} catch (error) {
			  console.error('Error fetching signer address:', error);
			}
		  }
	  
		  fetchSignerAddress();
    }, []);

    // Function to copy token contract address to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(tokenContractAddress);
            setCopySuccess(true);
            setTimeout(() => {
                setCopySuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div>
            {/* Render Navbar component with signer address */}
			<Navbar signerAddress={signerAddress} />
            <div className="max-w-4xl mx-auto py-12">
                {/* Title */}
                <h1 className="text-[#0b287b] text-4xl font-bold text-center mb-8">Step by Step Guide on How to Use the System</h1>
                {/* Conditional rendering based on user role (governance body users) */}
                {showGovernanceStep && (
                    <>
                        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-8 transition-opacity duration-1000 ${isLoaded ? 'opacity-100 animate-slideInRight' : 'opacity-0'}`}>
                            <div className="w-full h-[15rem] lg:h-[20rem] md:w-1/2 flex justify-center">
                                <img src={Step1Logo} alt="Step 1" className="w-[8rem] lg:w-[10rem]" />
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-left">
                                <h2 className="text-[#5e4b9c] text-4xl font-semibold mb-2">Step 1</h2>
                                <p className="p-4 text-[#384464] text-lg">Navigate to <Link to="/eventcreation" className="text-[#cc4d95]">Event Creation</Link> to create an event.</p>
                            </div>
                        </div>
                        <div className={`flex flex-col md:flex-row-reverse items-center justify-between gap-4 transition-opacity duration-1000 ${isLoaded ? 'opacity-100 animate-slideInLeftdelay750' : 'opacity-0 delay-150'}`}>
                            <div className="w-full h-[15rem] lg:h-[20rem] md:w-1/2 flex justify-center">
                                <img src={Step2Logo} alt="Step 1" className="w-[8rem] lg:w-[10rem]" />
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-right">
                                <h2 className="text-[#5e4b9c] text-4xl font-semibold mb-2">Step 2</h2>
                                <p className="p-4 text-[#384464] text-lg">Next, navigate to <Link to="/eventlist" className="text-[#cc4d95]">Event Voting</Link> to vote for the amount of tokens to be rewarded for each event.</p>
                            </div>
                        </div>
                        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-8 transition-opacity duration-1000 ${isLoaded ? 'opacity-100 animate-slideInRightdelay1000' : 'opacity-0'}`}>
                            <div className="w-full h-[15rem] lg:h-[20rem] md:w-1/2 flex justify-center">
                                <img src={Step3Logo} alt="Step 1" className="w-[10rem] lg:w-[12rem]" />
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-left">
                                <h2 className="text-[#5e4b9c] text-4xl font-semibold mb-2">Step 3</h2>
                                <p className="p-4 text-[#384464] text-lg">Then, navigate to <Link to="/createdlist" className="text-[#cc4d95]">Questionnaire Creation</Link> to create a custom questionnaire regarding your event after the voting period ends.</p>
                            </div>
                        </div>
                        <div className={`flex flex-col md:flex-row-reverse items-center justify-between gap-4 transition-opacity duration-1000 ${isLoaded ? 'opacity-100 animate-slideInLeftdelay1250' : 'opacity-0 delay-150'}`}>
                            <div className="w-full h-[15rem] lg:h-[20rem] md:w-1/2 flex justify-center">
                                <img src={Step4Logo} alt="Step 1" className="w-[10rem] lg:w-[12rem]" />
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-right">
                                <h2 className="text-[#5e4b9c] text-4xl font-semibold mb-2">Step 4</h2>
                                <p className="p-4 text-[#384464] text-lg">You're all set and the event you have created is open for <Link to="/studentevents" className="text-[#cc4d95]">Enrollment</Link>!.</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Conditional rendering based on user role (student users) */}
                {!showGovernanceStep && (
                <>
                    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-8 transition-opacity duration-1000 ${isLoaded ? 'opacity-100 animate-slideInRight' : 'opacity-0'}`}>
                            <div className="w-full h-[15rem] lg:h-[20rem] md:w-1/2 flex justify-center">
                                <img src={Step1Logo} alt="Step 1" className="w-[8rem] lg:w-[10rem]" />
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-left">
                                <h2 className="text-[#5e4b9c] text-4xl font-semibold mb-2">Step 1</h2>
                                <p className="p-4 text-[#384464] text-lg">Navigate to <Link to="/studentevents" className="text-[#cc4d95]">Event Enrollment</Link> to join events.</p>
                            </div>
                        </div>
                        <div className={`flex flex-col md:flex-row-reverse items-center justify-between gap-4 transition-opacity duration-1000 ${isLoaded ? 'opacity-100 animate-slideInLeftdelay750' : 'opacity-0 delay-150'}`}>
                            <div className="w-full h-[15rem] lg:h-[20rem] md:w-1/2 flex justify-center">
                                <img src={Step2Logo} alt="Step 1" className="w-[8rem] lg:w-[10rem]" />
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-right">
                                <h2 className="text-[#5e4b9c] text-4xl font-semibold mb-2">Step 2</h2>
                                <p className="p-4 text-[#384464] text-lg">When the event has started, navigate to <Link to="/claimtoken" className="text-[#cc4d95]">Claim Tokens</Link> to mark your attendance.</p>
                            </div>
                        </div>
                        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-8 transition-opacity duration-1000 ${isLoaded ? 'opacity-100 animate-slideInRightdelay1000' : 'opacity-0'}`}>
                            <div className="w-full h-[15rem] lg:h-[20rem] md:w-1/2 flex justify-center">
                                <img src={Step3Logo} alt="Step 1" className="w-[10rem] lg:w-[12rem]" />
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-left">
                                <h2 className="text-[#5e4b9c] text-4xl font-semibold mb-2">Step 3</h2>
                                <p className="p-4 text-[#384464] text-lg">Then, click on claim tokens and fill out the event's questionnaire to claim your tokens.</p>
                            </div>
                        </div>
                        <div className={`flex flex-col md:flex-row-reverse items-center justify-between gap-4 transition-opacity duration-1000 ${isLoaded ? 'opacity-100 animate-slideInLeftdelay1250' : 'opacity-0 delay-150'}`}>
                            <div className="w-full h-[15rem] lg:h-[20rem] md:w-1/2 flex justify-center">
                                <img src={Step4Logo} alt="Step 1" className="w-[10rem] lg:w-[12rem]" />
                            </div>
                            <div className="w-full md:w-1/2 text-center md:text-right">
                                <h2 className="text-[#5e4b9c] text-4xl font-semibold mb-2">Step 4</h2>
                                <p className="p-4 text-[#384464] text-lg">
                                    To import NOTT tokens into your MetaMask wallet, open your wallet and click on "Import Tokens" then fill in the
                                    <button className="text-[#cc4d95] ml-1" onClick={copyToClipboard}>
                                        Token Contract Address.
                                    </button>
                                    {copySuccess && <span className="text-green-500 ml-1">(Copied!)</span>}
                                </p>                           
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}