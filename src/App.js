import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import Claim from './pages/claim';
import Logout from './pages/logout';
import Signup from './pages/signup';
import Database from './pages/database';
import Login from './pages/login';
import CreateEventForm from './pages/eventcreation'
import EventList from './pages/eventlist'
import Connect from './pages/connect'
import VotePage from './pages/voting'
import StudentEvents from './pages/studentevent';
import CreatedList from './pages/createdlist';
import CreateQuestionnaire from './pages/questionnaire';

function App() {
  return (
    <Router>
      <div>
        <div className='component-container'>
          <Routes>
            <Route path="/" element={<Connect />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/claim" element={<Claim />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/database" element={<Database />} />
            <Route path="/logout" element={<Logout setAccountAddress={""} />} />
            <Route path="/eventcreation" element={<CreateEventForm />} />
            <Route path="/eventlist" element={<EventList />} />
            <Route path="/vote/:eventId" element={<VotePage />} />
            <Route path="/studentevents" element={<StudentEvents />} />
            <Route path="/createdlist" element={<CreatedList />} />
            <Route path="/questionnaire/:eventId" element={<CreateQuestionnaire />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
