    import React, { useState, useEffect } from 'react';
    import { ethers } from 'ethers';
    import { Link } from 'react-router-dom';
    import Collapsible from 'react-collapsible';
    import Navbar from '../components/Navbar';
    import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract';
    import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract';
    import { NOTTAddress, NOTTABI } from '../Address&Abi/NottinghamCoinContract';


    const ClaimToken = () => {
        const [enrolledAndPassedEvents, setEnrolledAndPassedEvents] = useState([]);
        const [signerAddress, setSignerAddress] = useState('');

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
        const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
        const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);

        useEffect(() => {
            async function fetchData() {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
                    const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
                    const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);
            
                    const events = await eventRegistryContract.getActiveEvents();
                    const currentTime = new Date().getTime();
            
                    const eventsWithDetails = await Promise.all(events.map(async (event) => {
                        const hasEnrolledPromise = eventRegistryContract.hasEnrolled(event.eventId, signer.getAddress());
                        const remainingTimePromise = votingContract.getRemainingTime(event.eventId);
                        const finalTokensPromise = votingContract.getEventFinalTokens(event.eventId);
                        const address = await signer.getAddress();
                        const claimedPromise = NOTTContract.hasClaimed(event.eventId, address);
            
                        const [hasEnrolled, remainingTime, finalTokens, claimed] = await Promise.all([
                            hasEnrolledPromise,
                            remainingTimePromise,
                            finalTokensPromise,
                            claimedPromise
                        ]);
            
                        const eventTime = event.time * 1000;
                        let status = currentTime < eventTime ? 'Active' : 'Past';
            
                        if (hasEnrolled && status === 'Past') {
                            return {
                                eventId: event.eventId,
                                name: event.name,
                                time: event.time,
                                venue: event.venue,
                                ipfsHash: event.ipfsHash,
                                description: event.description,
                                finalTokens: finalTokens.toNumber(),
                                remainingTime: remainingTime.toNumber(),
                                totalVotes: await votingContract.getTotalVotesForEvent(event.eventId),
                                claimed: claimed
                            };
                        }
                    }));
            
                    const enrolledAndPassedEventsDetails = eventsWithDetails.filter(event => event !== undefined);
                    setEnrolledAndPassedEvents(enrolledAndPassedEventsDetails);
                } catch (error) {
                    console.error('Error fetching enrolled and passed events:', error);
                }
            }
            
            fetchData();
    
            async function fetchSignerAddress() {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const address = await signer.getAddress();
                    setSignerAddress(address);
                } catch (error) {
                    console.error('Error fetching signer address:', error);
                }
            }
    
            fetchSignerAddress();
        }, []);
        
        const claimedEvents = enrolledAndPassedEvents.filter(event => event.claimed);
        const pendingClaimEvents = enrolledAndPassedEvents.filter(event => !event.claimed);    
        
        return (
            <div>
                <Navbar signerAddress={signerAddress} />
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Attended Events List</h3>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
        
                    <div className="collapsible-container mt-4">
                        <Collapsible trigger={<div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4">Claimable Events</div>} transitionTime={200}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                                {pendingClaimEvents.map((event, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                                        <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                            <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                            <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                            <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                            <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                            <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
                                        </div>
                                        <Link
                                            to={`/claim/${event.eventId}`}
                                            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center"
                                        >
                                            Claim Tokens
                                        </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Collapsible>
                    </div>
        
                    <div className="collapsible-container mt-4">
                        <Collapsible trigger={<div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4">Claimed Events</div>} transitionTime={200}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                                {claimedEvents.map((event, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                                        <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div>
                                                <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                                <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                                <p className="mt-1 text-gray-600">Time: {new Date(event.time).toLocaleString()}</p>
                                                <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                                <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                                <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Collapsible>
                    </div>
                </div>
            </div>
        );
    };

    export default ClaimToken;