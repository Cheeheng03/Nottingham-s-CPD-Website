/*
 * Source code written by SEGP Group P
 * Landing component for checking MetaMask installation and redirecting to connection page if installed for Nottingham s-CPD website 
 * External libraries used: react, react-router-dom
 */

import React, { useEffect } from 'react';
import metamaskgif from "../Images/metamask.gif";
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  // Initialize navigation hook
  const navigate = useNavigate();

  // Check for MetaMask installation on component mount
  useEffect(() => {
    if (window.ethereum) {
      navigate('/connect'); // Redirect to connection page if MetaMask is installed
    } else {
      console.log('MetaMask is not installed!'); // Log message if MetaMask is not installed
    }
  }, [navigate]); // Dependency array for useEffect

  // Render the Landing component UI
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-md flex flex-col items-center p-6">
            <div className="flex-shrink-0">
                <img src={metamaskgif} alt="MetaMask Logo" className="h-64 mb-6 w-full" />
            </div>
            <div>
                {/* Render message to install MetaMask */}
                <div className="font-mono text-2xl font-medium text-gray-900 text-center">
                    Please install <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">MetaMask</a> to continue.
                </div>
            </div>
        </div>
    </div>
  );
};

export default Landing;
