/*
 * Source code written by SEGP Group P
 * Home component for displaying dashboard and events for Nottingham s-CPD website
 * External libraries used: react, ethers, react-router-dom, recharts
 */

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import enrollgif from '../Images/enroll.gif';
import eth from '../Images/eth.gif';
import latest from '../Images/latest.gif';
import noevent from '../Images/noevent.gif';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract';
import { NOTTAddress, NOTTABI } from '../Address&Abi/NottinghamCoinContract';
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function Home() {
    // State variables
    const [signerAddress, setSignerAddress] = useState('');
    const [enrolledEventsLength, setEnrolledEventsLength] = useState(0);
    const [attendedEventsLength, setAttendedEventsLength] = useState(0);
    const [finalTokensNumber, setFinalTokensNumber] = useState(0);
    const [latestEvent, setOpenEvents] = useState([]);
    // Ethereum provider setup
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Fetch signer's address on component mount
    useEffect(() => {
        async function fetchSignerAddress() {
            try {
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setSignerAddress(address);
            } catch (error) {
                console.error('Error fetching signer address:', error);
            }
        }
        
        fetchSignerAddress();

        // Fetch data related to events and user participation
        async function fetchData() {
            try {
                const signer = provider.getSigner();
                const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
                const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);
                const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);

                const events = await eventRegistryContract.getActiveEvents();
                const eventsWithTokens = await Promise.all(
                    events.map(async (event) => {
                        const userHasEnrolled = await eventRegistryContract.hasEnrolled(event.eventId, signer.getAddress());
                        const userhasAttended = await NOTTContract.hasTakenAttendance(event.eventId, signer.getAddress());
                        const finalTokenAmount = await votingContract.getEventFinalTokens(event.eventId);
                        const claimedPromise = NOTTContract.hasClaimed(event.eventId, signer.getAddress());
                        return {
                            hasEnrolled: userHasEnrolled,
                            hasAttended: userhasAttended,
                            finalTokens: finalTokenAmount.toNumber() === 0 ? 5 : finalTokenAmount.toNumber(),
                            claimed: claimedPromise,
                        };
                    })
                );
                const enrolledEvents = eventsWithTokens.filter(event => event.hasEnrolled);
                const attendedEvents = enrolledEvents.filter(event => event.hasAttended);
                const totalClaimedTokens = attendedEvents.reduce((total, event) => {
                    if (event.claimed) {
                        return total + event.finalTokens;
                    }
                    return total;
                }, 0);
                setFinalTokensNumber(totalClaimedTokens);
                setEnrolledEventsLength(enrolledEvents.length);
                setAttendedEventsLength(attendedEvents.length);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }
    
        fetchData();

        // Fetch open events
        async function fetchOpenEvents() {
            try {
                const signer = provider.getSigner();
                const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
                const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
        
                const events = await eventRegistryContract.getActiveEvents();
                const openEventsDetails = await Promise.all(
                    events.map(async (event) => {
                        const userHasEnrolled = await eventRegistryContract.hasEnrolled(event.eventId, signer.getAddress());
                        const finalTokens = await votingContract.getEventFinalTokens(event.eventId);
                        const currentTime = new Date().getTime();
                        const eventTime = event.time * 1000;
                        let status = '';
                        if (currentTime < eventTime) {
                            status = 'Active';
                        } else {
                            status = 'Past';
                        }
                        if (!userHasEnrolled && status === 'Active') {
                            return {
                                eventId: event.eventId,
                                name: event.name,
                                time: event.time,
                                venue: event.venue,
                                ipfsHash: event.ipfsHash,
                                description: event.description,
                                finalTokens: finalTokens.toNumber() === 0 ? 5 : finalTokens.toNumber(),
                                status: status
                            };
                        }
                        return null;
                    })
                );
        
                const filteredOpenEventsDetails = openEventsDetails.filter(event => event !== null);
        
                setOpenEvents(filteredOpenEventsDetails);
            } catch (error) {
                console.error('Error fetching open events:', error);
            }
        }

        fetchOpenEvents();
    }, []);

    // Data for pie chart
    const chartData = [
        { name: 'Attended Events', value: attendedEventsLength },
        { name: 'Enrolled Events', value: enrolledEventsLength },
    ];

    // Render the Home component UI
    return (
        <div>
            {/* Render Navbar */}
            <Navbar signerAddress={signerAddress} />
            {/* Dashboard header */}
            <h3 className="text-4xl font-bold text-center text-[#0b287b] mt-4 mb-8">Dashboard</h3>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex flex-col lg:flex-row lg:space-x-4">
                    {/* Pie chart section */}
                    <div className="m:w-1/3 bg-[#3840b7] rounded-xl shadow-lg mb-4 flex animate-slideInLeft">
                        <div className="flex-grow flex items-center justify-center w-full lg:h-64">
                            {attendedEventsLength === 0 && enrolledEventsLength === 0 ? (
                                <div className="text-white text-center py-4 mt-0 lg:mt-16 md:w-[310px]">
                                    <img src={noevent} alt="No Event" className="w-full h-[13rem] lg:h-[15rem] rounded-xl mb-2" />
                                    <p className="text-s font-mono text-white flex-grow mb-2 p-2">
                                        Participate in events to access statistical insights.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-white text-center py-4 mt-0 lg:mt-16">
                                    <PieChart width={310} height={300} className="w-full h-full mb-4">
                                        <Pie
                                            data={chartData}
                                            cx={150}
                                            cy={150}
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={false}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#82ca9d' : '#d884ce'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend
                                            align="center"
                                            verticalAlign="bottom"
                                            wrapperStyle={{ color: '#fff', fontSize: '14px' }}
                                            contentStyle={{ color: '#fff' }}
                                            className="sm:text-xs mb-2"
                                        />
                                    </PieChart>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Latest event section */}
                    <div className="bg-white rounded-xl shadow-lg mb-4 flex flex-col lg:flex-row w-full h-80 animate-slideInRight">
                        <div className="flex-grow flex flex-col sm:flex-row p-0">
                            <div className="flex-1 flex flex-col sm:flex-row">
                                <div className="flex-none w-full hidden lg:flex sm:w-1/2 overflow-hidden rounded-l-xl items-center justify-center">
                                    <img 
                                        src={latest}
                                        alt="latest"
                                        className="w-full h-[10rem] lg:h-[13rem] xl:h-[18rem] object-cover" 
                                    />
                                </div>
                                <div className='flex-1 p-4 rounded-t-xl rounded-b-xl lg:rounded-r-xl lg:rounded-l-none items-center justify-center' style={{ background: 'linear-gradient(to right, #0b287b, #0e2b7d, #172f84, #23378c, #2e3b8f, #394094, #404294, #4a4597, #544898, #5e4b9c, #694f9d, #7453a0, #7f56a1, #8559a3)', color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    {latestEvent.length > 0 ? (
                                        <>
                                        <h3 className="text-4xl xl:text-5xl font-semibold mb-10 mt-10">Latest Event:</h3>
                                        <p className="text-center">Name: {latestEvent[0].name}</p>
                                        <p className="mt-1 text-center lg:text-left">Time: {new Date(latestEvent[0].time * 1000).toLocaleString()}</p>
                                        <p className="mt-1 text-center">Tokens Rewarded: {latestEvent[0].finalTokens}</p>
                                        <a href={`/enroll/${latestEvent[0].eventId}`} className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600 flex items-center justify-center w-full lg:w-1/3">
                                            View
                                        </a>
                                        </>
                                    ) : (
                                        <>
                                        <h3 className="font-semibold text-4xl xl:text-5xl mb-10 mt-10">Check out our latest events now!</h3>
                                        <a href="/eventenrollmentlist" className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 hover:bg-blue-600 flex items-center justify-center w-full lg:w-1/3">
                                            Go
                                        </a>
                                        </>
                                    )}
                                </div>
                            </div>                      
                        </div>
                    </div>
                </div>

                {/* Enrollment and tokens section */}
                <div className="flex flex-col lg:flex-row lg:space-x-4">
                    {/* Enrollment section */}
                    <div className="lg:w-1/2 bg-white rounded-xl shadow-lg mb-4 animate-slideInLeft">
                        <div className="flex-grow h-52 lg:h-[20rem]">
                            <img src={enrollgif} alt="Enroll" className="w-full h-full object-cover rounded-t-xl" />
                        </div>
                        <Link to="/eventenrollmentlist" className="block">
                            <div 
                                className="flex items-center justify-center lg:justify-between p-2 lg:p-4 bg-[#0b287b] rounded-b-xl cursor-pointer"
                                style={{ 
                                    minHeight: '4rem',
                                    transition: 'all 0.5s ease-in-out',
                                    backgroundSize: '200% 200%',
                                    backgroundImage: 'linear-gradient(to left, #0b287b, #162b88, #1e2f95, #2633a2, #2e37af, #3840b7, #4249bf, #4b52c7, #5762d2, #6372dd, #6f82e8, #7b92f3)',
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundPosition = 'right bottom'}
                                onMouseOut={e => e.currentTarget.style.backgroundPosition = 'left top'}
                            >
                                <h3 className="text-m lg:text-3xl font-semibold text-white flex-grow">
                                    Click me to join an event now!
                                </h3>
                            </div>
                        </Link>
                    </div>
    
                    {/* Tokens section */}
                    <Link to="/studentevents" className="lg:w-1/2 rounded-xl shadow-lg mb-4 overflow-hidden animate-slideInRight" style={{ background: 'linear-gradient(to top, #212465, #4971df)' }}>
                        <div className="flex flex-col justify-between h-full" style={{ minHeight: '20rem', maxHeight: '32rem' }}>
                            <div className="flex-grow flex justify-center items-center">
                                <img src={eth} alt="Ethereum" className="object-contain h-64 max-w-full px-4" />
                            </div>
                            <div className="text-white text-center py-4">
                                <p className="text-m lg:text-3xl font-semibold text-white flex-grow mb-1">
                                    Nottingham Tokens Claimed: {finalTokensNumber} NOTT
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
