/*
 * Source code written by SEGP Group P
 * Website guide component for guiding users on using the Nottingham s-CPD website
 * External libraries used: react, ethers
 */

import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import TokenClaimmableEventList from './pages/token-claimmableeventlist';
import Logout from './pages/logout';
import Signup from './pages/signup';
import Login from './pages/login';
import CreateEventForm from './pages/eventcreation'
import EventVotingList from './pages/eventvotinglist'
import Connect from './pages/connect'
import VotePage from './pages/voting'
import EventEnrollmentList from './pages/eventenrollmentlist';
import QuestionnaireCreationEventList from './pages/questionnairecreationeventlist';
import CreateQuestionnaire from './pages/createquestionnaire';
import EditQuestionnaire from './pages/editquestionnaire';
import Enroll from './pages/enroll';
import Claim from './pages/claim';
import Attendance from './pages/attendance';
import Landing from './pages/landing';
import WebsiteGuide from './pages/websiteguide';

/**
 * Main component for routing and rendering different pages of the application.
 */
function App() {
  return (
    <Router>
      <div>
        <div className='component-container'>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/guideline" element={<WebsiteGuide />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/token-claimmableeventlist" element={<TokenClaimmableEventList />} />
            <Route path="/claim/:eventId" element={<Claim />} />
            <Route path="/attendance/:eventId" element={<Attendance />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/logout" element={<Logout setAccountAddress={""} />} />
            <Route path="/eventcreation" element={<CreateEventForm />} />
            <Route path="/eventvotinglist" element={<EventVotingList />} />
            <Route path="/vote/:eventId" element={<VotePage />} />
            <Route path="/eventenrollmentlist" element={<EventEnrollmentList />} />
            <Route path="/questionnairecreationeventlist" element={<QuestionnaireCreationEventList />} />
            <Route path="/questionnaire/:eventId" element={<CreateQuestionnaire />} />
            <Route path="/editquestionnaire/:eventId" element={<EditQuestionnaire />} />
            <Route path="/enroll/:eventId" element={<Enroll />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
