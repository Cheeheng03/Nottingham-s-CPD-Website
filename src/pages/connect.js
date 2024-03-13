import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { StudentInfoAddress, StudentInfoAbi } from '../Address&Abi/StudentRegistryContract';

function Connect() {
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        initializeMetaMask();
    }, []);

    const initializeMetaMask = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                setIsMetaMaskConnected(true);
            } catch (error) {
                console.error(error);
            }
        }
    };

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

    const signUp = () => {
        navigate('/signup');
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="bg-gray-100 rounded-2xl shadow-lg max-w-md mx-auto p-8">
                <h2 className="font-bold text-2xl text-[#002D74] mb-6 text-center">Connect to MetaMask</h2>
                {isMetaMaskConnected ? (
                    <button 
                        className="w-full bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-[#002D74]/90 focus:outline-none focus:shadow-outline mb-4" 
                        onClick={connectToMetaMask}>
                        Connect
                    </button>
                ) : (
                    <button 
                        className="w-full bg-gray-300 text-white font-bold py-2 px-4 rounded hover:bg-[#002D74]/90 focus:outline-none focus:shadow-outline mb-4" 
                        disabled={true}>
                        Loading
                    </button>
                )}
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
