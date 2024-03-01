import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { StudentInfoAddress, StudentInfoAbi } from '../Address&Abi/StudentRegistryContract';

function Login() {
    const [studentID, setStudentID] = useState('');
    const [password, setPassword] = useState('');
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
    const navigate = useNavigate();


    const handleLogin = async () => {
        try {
            if (!studentID.trim() || !password.trim()) {
                alert("Please enter both student ID and password.");
                return;
            }
    
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const studentInfoContract = new ethers.Contract(StudentInfoAddress, StudentInfoAbi, provider);
    
            const result = await studentInfoContract.getStudentInfoByStudentID(studentID);
    
            const [foundStudentID, name, email, contractPassword, walletAddress] = result;
    
            if (foundStudentID === studentID && contractPassword === password) {
                alert("Login successful.");
                navigate('/home');
            } else {
                alert("Invalid student ID or password.");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to log in. Please try again later.");
        }
    };

    const navigateToSignup = () => {
        navigate('/signup');
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="bg-gray-100 rounded-2xl shadow-lg max-w-md mx-auto p-8">
            <h2 className="font-bold text-2xl text-[#002D74] mb-6 text-center">Login</h2>
             <div className="flex items-center mb-4">
                  <label className="block text-gray-700 text-sm font-bold mr-2 w-32">Student ID:</label>
                  <input className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="studentID" placeholder="Student ID" type="text" value={studentID} onChange={(e) => setStudentID(e.target.value)} />
                </div>
                <div className="flex items-center mb-6">
                  <label className="block text-gray-700 text-sm font-bold mr-2 w-32">Password:</label>
                  <input className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="flex items-center mb-6">
                  <button className="w-1/2 bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-[#002D74]/90 focus:outline-none focus:shadow-outline" onClick={handleLogin}>
                    Login
                  </button>
                  <button className="w-1/2 bg-[#34D399] text-white font-bold py-2 px-4 rounded ml-2 hover:bg-[#2CC185] focus:outline-none focus:shadow-outline" onClick={navigateToSignup}>
                    Signup
                  </button>
                </div>
          </div>
        </div>
      );
}

export default Login;