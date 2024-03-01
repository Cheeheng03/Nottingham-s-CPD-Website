import React from 'react';

function Navbar({ signerAddress }) {
  const showFullNavbar = signerAddress === '0x2Ffd02772a9A33D73aD16908dF16900AD1326f3E';

  return (
    <nav className='bg-[#002D74] text-white p-4 flex justify-between items-center'>
      <a href='/' className='text-2xl font-bold'>Nottingham s-CPD Events</a>
      <ul className='flex space-x-4'>
        <li><a href="/home" className='hover:underline'>Home</a></li>
        <li><a href="/claimtoken" className='hover:underline'>Claim Tokens</a></li>
        <li><a href="/studentevents" className='hover:underline'>Event Enrollment</a></li>
        {showFullNavbar && (
          <>
            <li><a href="/eventcreation" className='hover:underline'>Event Creation</a></li>
            <li><a href="/eventlist" className='hover:underline'>Event Voting</a></li>
            <li><a href="/createdlist" className='hover:underline'>Questionnaire Creation</a></li>
          </>
        )}  
        <li><a href="/logout" className='hover:underline'>Logout</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;

