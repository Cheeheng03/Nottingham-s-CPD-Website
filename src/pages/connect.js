/*
 * Source code written by SEGP Group P
 * Connect component for Nottingham s-CPD website
 * External libraries used: react, react-router-dom, ethers
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import logo from '../Images/logo2.png'
import { StudentInfoAddress, StudentInfoAbi } from '../Address&Abi/StudentRegistryContract';

function Connect() {
    // State to track MetaMask connection status
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
    // Hook for programmatic navigation
    const navigate = useNavigate();

    // Initialize MetaMask connection on component mount
    useEffect(() => {
        initializeMetaMask();
    }, []);

    // Function to initialize MetaMask connection
    const initializeMetaMask = async () => {
        if (window.ethereum) {
            try {
                // Request MetaMask account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                setIsMetaMaskConnected(true);
            } catch (error) {
                console.error(error);
            }
        }
    };

    // Function to fetch MetaMask account address
    const fetchMetaMaskAddress = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            return address;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    // Function to connect to MetaMask and retrieve student info
    const connectToMetaMask = async () => {
        try {
            const accountAddress = await fetchMetaMaskAddress();
            if (accountAddress) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const studentContract = new ethers.Contract(StudentInfoAddress, StudentInfoAbi, signer);
                const studentInfo = await studentContract.getStudentInfoByAddress(accountAddress);
                console.log(studentInfo);
                if (
                    studentInfo &&
                    typeof studentInfo[0] !== "undefined" &&
                    typeof studentInfo[1] !== "undefined" &&
                    typeof studentInfo[2] !== "undefined" &&
                    typeof studentInfo[3] !== "undefined" &&
                    typeof studentInfo[4] !== "undefined" &&
                    studentInfo[0] !== "" &&
                    studentInfo[1] !== "" &&
                    studentInfo[2] !== "" &&
                    studentInfo[3] !== "" &&
                    studentInfo[4] !== "0x0000000000000000000000000000000000000000"
                ) {
                    navigate('/home');
                } else {
                    alert('You are not yet registered. Please Sign Up for an account!');
                }
            } else {
                alert('No MetaMask account selected.');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to MetaMask. Please make sure MetaMask is installed and unlocked.');
        }
    };

    // Function to navigate to Sign Up page
    const signUp = () => {
        navigate('/signup');
    };

    // Render the Connect component UI
    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="bg-gray-100 rounded-2xl shadow-lg max-w-md mx-auto p-8">
                <img src={logo} alt="Logo" className="h-32 mb-6 w-full" />
                <h2 className="font-bold text-xl text-[#002D74] mb-6 text-center">Login to Nottingham s-CPD website</h2>
                
                {/* Render Connect button if MetaMask is connected */}
                {isMetaMaskConnected ? (
                    <button 
                        className="w-full bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-[#002D74]/90 focus:outline-none focus:shadow-outline mb-4" 
                        onClick={connectToMetaMask}>
                        Connect
                    </button>
                ) : (
                    // Render disabled button if MetaMask is not connected
                    <button 
                        className="w-full bg-gray-300 text-white font-bold py-2 px-4 rounded hover:bg-[#002D74]/90 focus:outline-none focus:shadow-outline mb-4" 
                        disabled={true}>
                        Loading
                    </button>
                )}
                {/* Render Sign Up button */}
                <button 
                    className="w-full bg-gray-300 text-[#002D74] font-bold py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:shadow-outline" 
                    onClick={signUp}>
                    Sign Up
                </button>
            </div>
        </div>
    );
}

export default Connect;
