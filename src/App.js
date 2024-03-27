import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import ClaimToken from './pages/claimtokens';
import Logout from './pages/logout';
import Signup from './pages/signup';
import Login from './pages/login';
import CreateEventForm from './pages/eventcreation'
import EventList from './pages/eventlist'
import Connect from './pages/connect'
import VotePage from './pages/voting'
import StudentEvents from './pages/studentevent';
import CreatedList from './pages/createdlist';
import CreateQuestionnaire from './pages/questionnaire';
import EditQuestionnaire from './pages/editquestionnaire';
import Enroll from './pages/enroll';
import Claim from './pages/claim';
import Attendance from './pages/attendance';
import Landing from './pages/landing';
import Steps from './pages/steps';

function App() {
  return (
    <Router>
      <div>
        <div className='component-container'>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/guideline" element={<Steps />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/claimtoken" element={<ClaimToken />} />
            <Route path="/claim/:eventId" element={<Claim />} />
            <Route path="/attendance/:eventId" element={<Attendance />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/logout" element={<Logout setAccountAddress={""} />} />
            <Route path="/eventcreation" element={<CreateEventForm />} />
            <Route path="/eventlist" element={<EventList />} />
            <Route path="/vote/:eventId" element={<VotePage />} />
            <Route path="/studentevents" element={<StudentEvents />} />
            <Route path="/createdlist" element={<CreatedList />} />
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
