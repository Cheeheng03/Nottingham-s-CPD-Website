import React from 'react';

function Navbar() {
  return (
    <nav className='nav'>
      <a href='/' className='menu'>Nottingham SCPD events</a>
      <ul>
        <li><a href="/claim">Claim Tokens</a></li>
        {/* <li><a href="/signup">Sign Up</a></li> */}
        {/*    */}
        {/* <li><a href="/login">Login</a></li> */}
        <li><a href="/eventcreation">Event Creation</a></li>
        <li><a href="/eventlist">Event List</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
