import React, { useEffect } from 'react';
import metamaskgif from "../Images/metamask.gif";
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.ethereum) {
      navigate('/connect');
    } else {
      console.log('MetaMask is not installed!');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-md flex flex-col items-center p-6">
            <div className="flex-shrink-0">
                <img src={metamaskgif} alt="MetaMask Logo" className="h-64 mb-6 w-full" />
            </div>
            <div>
            <div className="font-mono text-2xl font-medium text-gray-900 text-center">
                Please install <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">MetaMask</a> to continue.
            </div>
            </div>
        </div>
    </div>
  );
};

export default Landing;
