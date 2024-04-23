/*
 * Source code written by SEGP Group P
 * Navbar component for the project
 * Adapted from React Bootstrap Navbar component
 * External libraries used: ethers, react-router-dom, @fortawesome/react-fontawesome
 */

import React, { useState, useEffect } from 'react';
import logo from '../Images/logo.png';
import profile from '../Images/profile.png'
import { Link } from 'react-router-dom';
import { StudentInfoAddress, StudentInfoAbi } from '../Address&Abi/StudentRegistryContract';
import { ethers } from 'ethers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCoins, faCalendarAlt, faPlus, faVoteYea, faClipboardList, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';

function Navbar({ signerAddress }) {
  // State variables
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [studentName, setStudentName] = useState('');

  // Function to fetch student info from the blockchain
  useEffect(() => {
    async function fetchStudentInfo() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(StudentInfoAddress, StudentInfoAbi, provider);
        const studentInfo = await contract.getStudentInfoByAddress(signerAddress);
        setStudentName(studentInfo[1]);
      } catch (error) {
        console.error('Error fetching student info:', error);
      }
    }

    if (signerAddress) {
      fetchStudentInfo();
    }
  }, [signerAddress]);

  // Function to set current day and date
  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const optionsDay = { weekday: 'long' };
      const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDay(date.toLocaleDateString('en-US', optionsDay));
      setCurrentDate(date.toLocaleDateString('en-US', optionsDate));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Function to toggle navigation menu
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Check if the full navbar should be shown
  const showFullNavbar = signerAddress === '0x2Ffd02772a9A33D73aD16908dF16900AD1326f3E' || signerAddress === '0x0a7665c13953491c66A3313c1256c2800E5D9853' || signerAddress === '0x59BA804564A7dD67A2b29F319d9983414284c297' || signerAddress === '0xa504E86C89Cc27fE8422316293d00b4ef945E4De';

  return (
    <nav className='text-white p-4 flex justify-between items-center' style={{ background: 'linear-gradient(to right, #0b287b, #0e2b7d, #172f84, #23378c, #2e3b8f, #394094, #404294, #4a4597, #544898, #5e4b9c, #694f9d, #7453a0, #7f56a1, #8559a3)' }}>
      <button 
        onClick={toggleNav}
        className={`z-20 text-white ${isNavOpen ? 'fixed' : ''}`}
      >
        {isNavOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>
      {/* Display current day and date */}
      <div className="hidden sm:block">
        <div className="ml-10 flex items-center">
          <div className="mr-4">
            <div>{currentDay}</div>
            <div>{currentDate}</div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center flex-grow">
        <Link to="/home">
            <img src={logo} alt="Logo" className="h-10 sm:h-8 md:h-10 lg:h-12 xl:h-12 cursor-pointer" />
        </Link>
      </div>
      
      {/* Display username and profile image */}
      <div className="hidden sm:block">
        {studentName && (
          <div className="flex items-center">
            <span className="order-1 mr-2">{studentName}</span>
            <img src={profile} alt="profile" className="order-2 h-10 md:h-10 lg:h-12 xl:h-12" />
          </div>
        )}
      </div>

      {/* Navigation menu */}
      <div className={`fixed top-0 left-0 w-full md:w-1/2 lg:w-1/4 xl:w-1/5 2xl:w-1/6 h-full transform ${isNavOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-10 flex justify-center items-center`} style={{ background: 'linear-gradient(to right, #0b287b, #0e2b7d, #172f84)' }}>
        <ul className='flex top-20 flex-col items-start justify-start min-h-full' style={{ position: 'relative' }}>
          <li className='py-4 flex items-center'>
            <FontAwesomeIcon icon={faHome} className='mr-3' />
            <a href="/home" className='hover:underline text-white text-lg'>Home</a>
          </li>
          <li className='py-4 flex items-center'>
            <FontAwesomeIcon icon={faCoins} className='mr-3' />
            <a href="/token-claimmableeventlist" className='hover:underline text-white text-lg'>Claim Tokens</a>
          </li>
          <li className='py-4 flex items-center'>
            <FontAwesomeIcon icon={faCalendarAlt} className='mr-3' />
            <a href="/eventenrollmentlist" className='hover:underline text-white text-lg'>Event Enrollment</a>
          </li>
          {/* Show additional navbar for users of governance body */}
          {showFullNavbar && (
            <>
              <li className='py-4 flex items-center'>
                <FontAwesomeIcon icon={faPlus} className='mr-3' />
                <a href="/eventcreation" className='hover:underline text-white text-lg'>Event Creation</a>
              </li>
              <li className='py-4 flex items-center'>
                <FontAwesomeIcon icon={faVoteYea} className='mr-3' />
                <a href="/eventvotinglist" className='hover:underline text-white text-lg'>Event Voting</a>
              </li>
              <li className='py-4 flex items-center'>
                <FontAwesomeIcon icon={faClipboardList} className='mr-3' />
                <a href="/questionnairecreationeventlist" className='hover:underline text-white text-lg'>Questionnaire Creation</a>
              </li>
            </>
          )}
          <li className='py-4 flex items-center'>
            <FontAwesomeIcon icon={faUser} className='mr-3' />
            <a href="/guideline" className='hover:underline text-white text-lg'>User Guide</a>
          </li>
          <li className='py-4 flex items-center'>
            <FontAwesomeIcon icon={faSignOutAlt} className='mr-3' />
            <a href="/logout" className='hover:underline text-white text-lg'>Logout</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
