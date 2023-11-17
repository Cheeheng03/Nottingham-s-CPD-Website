import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Connect() {
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
    const navigate = useNavigate();

    const connectToMetaMask = async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            setIsMetaMaskConnected(true);
            alert('Connected to MetaMask!');
            navigate('/login'); // Redirect to login on successful connection
        } catch (error) {
            console.error(error);
            alert('Failed to connect to MetaMask. Please make sure MetaMask is installed and unlocked.');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="bg-gray-100 rounded-2xl shadow-lg max-w-md mx-auto p-8">
                <h2 className="font-bold text-2xl text-[#002D74] mb-6 text-center">Connect to MetaMask</h2>
                <button 
                    className="w-full bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-[#002D74]/90 focus:outline-none focus:shadow-outline" 
                    onClick={connectToMetaMask}>
                    Connect
                </button>
            </div>
        </div>
    );
}

export default Connect;
