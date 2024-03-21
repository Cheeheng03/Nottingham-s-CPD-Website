import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import signup from "../Images/signup.jpg"
import { StudentInfoAddress, StudentInfoAbi } from '../Address&Abi/StudentRegistryContract';

function Signup() {
  const [studentID, setStudentID] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetaMaskAddress = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        await provider.send('eth_requestAccounts', []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMetaMaskAddress();
  }, []);

  const registerStudent = async (event) => {
    event.preventDefault();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(StudentInfoAddress, StudentInfoAbi, signer);

    try {
      setLoading(true);
      const txResponse = await contract.registerStudent(studentID, name, email, password);
      await txResponse.wait();
      setLoading(false);
      alert('Student registered successfully.');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Student already registered.');
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(e.target.value === password);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      {loading && (
            <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-gray-200"></div>
                <p className="text-white ml-3">Please wait for the transaction to be successful...</p>
            </div>
          )}
      <div className="flex flex-wrap max-w-6xl h-[45rem] mx-auto">
        <div className="hidden lg:block lg:w-1/2 overflow-hidden rounded-l-2xl">
          <img 
            src={signup}
            alt="Sign Up" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full lg:w-1/2 p-8 bg-gray-100 rounded-r-2xl shadow-lg">
          <h2 className="font-bold text-5xl text-[#002D74] mt-20 mb-20 text-center">Student Sign Up</h2>
          <form onSubmit={registerStudent} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center mb-6">
                <label className="block text-gray-700 text-sm font-bold mr-2 w-32" htmlFor="studentID">Student ID:</label>
                <input className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  id="studentID"
                  value={studentID}
                  onChange={(e) => setStudentID(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center mb-6">
                <label className="block text-gray-700 text-sm font-bold mr-2 w-32" htmlFor="name">Name:</label>
                <input className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center mb-6">
                <label className="block text-gray-700 text-sm font-bold mr-2 w-32" htmlFor="email">Email:</label>
                <input className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center mb-6">
                <label className="block text-gray-700 text-sm font-bold mr-2 w-32" htmlFor="password">Password:</label>
                <input className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center mb-14">
                <label className="block text-gray-700 text-sm font-bold mr-2 w-32" htmlFor="confirmPassword">Confirm Password:</label>
                <input className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                {!passwordMatch && <p>Passwords do not match.</p>}
              </div>
              

              <div className="flex items-center mb-2">
                <button className="w-1/2 bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-[#002D74]/90 focus:outline-none focus:shadow-outline" type="submit">Register</button>
                <button className="w-1/2 bg-[#34D399] text-white font-bold py-2 px-4 rounded ml-2 hover:bg-[#2CC185] focus:outline-none focus:shadow-outline" onClick={() => navigate('/')}>
                  Back 
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>

  );
}

export default Signup;
