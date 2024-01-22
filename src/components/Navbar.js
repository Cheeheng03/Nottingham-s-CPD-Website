import React from 'react';

function Navbar() {
  return (
    <nav className='bg-[#002D74] text-white p-4 flex justify-between items-center'>
      <a href='/' className='text-2xl font-bold'>Nottingham SCPD Events</a>
      <ul className='flex space-x-4'>
        <li><a href="/home" className='hover:underline'>Home</a></li>
        <li><a href="/claim" className='hover:underline'>Claim Tokens</a></li>
        <li><a href="/eventcreation" className='hover:underline'>Event Creation</a></li>
        <li><a href="/eventlist" className='hover:underline'>Event List</a></li>
        <li><a href="/studentevents" className='hover:underline'>Student Events List</a></li>
        <li><a href="/createdlist" className='hover:underline'>Created Events List</a></li>
        <li><a href="/logout" className='hover:underline'>Logout</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
