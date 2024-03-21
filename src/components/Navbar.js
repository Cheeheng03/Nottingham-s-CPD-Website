import React from 'react';
import { useLocation } from 'react-router-dom';

function Navbar({ signerAddress }) {
  const location = useLocation();
  const showFullNavbar = signerAddress === '0x98E71F9E374864f9D200EbAf0cDEd4A2552B8b45';

  return (
    <nav className="bg-blue-900 text-white py-4 px-8 flex justify-between items-center">
      <a href="/" className="text-3xl font-bold">Nottingham s-CPD Events</a>
      <ul className="flex space-x-8 uppercase">
        <NavItem path="/home" label="Home" isActive={location.pathname === '/home'} />
        <NavItem path="/claimtoken" label="Claim Tokens" isActive={location.pathname === '/claimtoken'} />
        <NavItem path="/studentevents" label="Event Enrollment" isActive={location.pathname === '/studentevents'} />
        {showFullNavbar && (
          <>
            <NavItem path="/eventcreation" label="Event Creation" isActive={location.pathname === '/eventcreation'} />
            <NavItem path="/eventlist" label="Event Voting" isActive={location.pathname === '/eventlist'} />
            <NavItem path="/createdlist" label="Questionnaire Creation" isActive={location.pathname === '/createdlist'} />
          </>
        )}  
        <NavItem path="/logout" label="Logout" isActive={location.pathname === '/logout'} />
      </ul>
    </nav>
  );
}

function NavItem({ path, label, isActive }) {
  return (
    <li>
      <a href={path} className={`hover:underline ${isActive ? 'font-semibold text-yellow-400' : ''}`}>
        {label}
      </a>
    </li>
  );
}

export default Navbar;
