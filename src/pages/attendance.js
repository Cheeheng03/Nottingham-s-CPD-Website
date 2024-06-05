/*
 * Source code written by SEGP Group P
 * Attendance component for Nottingham s-CPD website
 * Adapted from React components and Google Maps API
 * External libraries used: react-icons, react-router-dom, @react-google-maps/api
 */
import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';
import loadinggif from '../Images/loading.gif';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import { NOTTAddress, NOTTABI } from '../Address&Abi/NottinghamCoinContract'
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract';

// Libraries and initial location coordinates required for Google Maps API
const libraries = ['places'];
const initialCenter = {
  lat: 2.9438,
  lng: 101.8734,
};

const Attendance = () => {
    const { eventId } = useParams();
    const [signerAddress, setSignerAddress] = useState('');
    const [venueArea, setVenueArea] = useState(null);
    const currentLocationRef = useRef(initialCenter);
    const [withinAttendanceArea, setWithinAttendanceArea] = useState(false);
    const [timer, setTimer] = useState(0);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const [isAttendanceDue, setIsAttendanceDue] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const { isLoaded, loadError } = useLoadScript({
      googleMapsApiKey: 'AIzaSyB92jFfU2cogCEM03VKTJwNTwXfd_iLH1I',
      libraries,
    });

    // Ethereum provider and contract instances
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
    const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);

    // Effect hook to fetch attendance-related data and initialize Google Maps
    useEffect(() => {
        // Function to check if attendance has been taken
        const checkAttendanceTaken = async () => {
            try {
                const hasAttended = await NOTTContract.hasTakenAttendance(eventId, signerAddress);
                setAttendanceMarked(hasAttended);
            } catch (error) {
                console.error('Error checking attendance:', error);
            }
        };
    
        if (eventId && signerAddress) {
            checkAttendanceTaken();
        }
    
        // Function to fetch event details and determine attendance area
        async function fetchEventDetails() {
            try {
                const eventData = await eventRegistryContract.getEvent(eventId);
                fetchVenueRadius(eventData.venue);
    
                const eventStartTime = new Date(eventData.time * 1000);
                const threeHoursLater = new Date(eventStartTime.getTime() + 3 * 60 * 60 * 1000);
                const now = new Date();
                const timeDifference = threeHoursLater.getTime() - now.getTime();
                setTimer(Math.max(0, timeDifference / 1000));
                setIsAttendanceDue(timeDifference < 0);
            } catch (error) {
                console.error('Error fetching event details:', error);
            }
        }
    
        if (eventId && eventRegistryContract && signerAddress) {
            fetchEventDetails();
        }
    
        // Function to fetch the signer's Ethereum address
        async function fetchSignerAddress() {
            try {
                const address = await signer.getAddress();
                setSignerAddress(address);
            } catch (error) {
                console.error('Error fetching signer address:', error);
            }
        }
    
        fetchSignerAddress();
    
        // Function to check if the user is within the attendance area
        const checkAttendanceArea = (location) => {
            if (venueArea) {
                const distance = getDistanceFromLatLonInM(location.lat, location.lng, venueArea.center.lat, venueArea.center.lng);
                if (distance < venueArea.radius) {
                    setWithinAttendanceArea(true);
                } else {
                    setWithinAttendanceArea(false);
                }
            }
        };
    
        // Function to watch the user's geolocation
        const watchPosition = () => {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            };
    
            const watcher = navigator.geolocation.watchPosition(
                (position) => {
                    const newPos = {
                        lat: parseFloat(position.coords.latitude),
                        lng: parseFloat(position.coords.longitude),
                    };
                    currentLocationRef.current = newPos;
                    checkAttendanceArea(newPos);
                },
                (error) => {},
                options
            );
    
            return () => navigator.geolocation.clearWatch(watcher);
        };
    
        watchPosition();
    
    }, [eventId, NOTTContract, signerAddress, eventRegistryContract, signer]);
    
    
    // Effect hook to set initial loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 2000);
    
        return () => clearTimeout(timer);
    }, []);

    // Function to fetch the venue's attendance radius
    const fetchVenueRadius = (venue) => {
        const areas = {
            "F3C04": { id: "F3", center: { lat: 2.94525, lng: 101.8765 }, radius: 40 },
            "F1A04": { id: "F1", center: { lat: 2.9450556, lng: 101.8756111 }, radius: 60 },
            "F1A12": { id: "F1", center: { lat: 2.9450556, lng: 101.8756111 }, radius: 60 },
            "TCR1": { id: "TCR", center: { lat: 2.94547, lng: 101.87583 }, radius: 20 },
            "F1A13": { id: "F1", center: { lat: 2.9450556, lng: 101.8756111 }, radius: 60 },
            "F4C02": { id: "F4", center: { lat: 2.945718, lng: 101.876794 }, radius: 23 },
            "BB80":  { id: "BB", center: { lat: 2.945972, lng: 101.874194 }, radius: 50 },
            "Great Hall": { id: "Trent", center: { lat: 2.9453056, lng: 101.8746944 }, radius: 50 },
        };

        const area = areas[venue];
        if (area) {
            setVenueArea(area);
        } else {
            console.log("Venue not found, no specific attendance area set.");
        }
    };

    // Function to calculate the distance between two locations
    const getDistanceFromLatLonInM = (lat1, lng1, lat2, lng2) => {
        var R = 6371;
        var dLat = deg2rad(lat2-lat1);
        var dLon = deg2rad(lng2-lng1); 
        var a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var distance = R * c * 1000;
        return distance;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI/180);
    };

    // Function to handle attendance marking
    const handleTakeAttendance = async () => {
        if (!isInitialLoading && withinAttendanceArea && !attendanceMarked && !markingAttendance) {
            setMarkingAttendance(true);
            try {
                setLoading(true);
                const transaction = await NOTTContract.markAttendance(eventId);
                await transaction.wait();
                setLoading(false);
                setAttendanceMarked(true);
                alert("Attendance marked successfully!");
            } catch (error) {
                console.error('Error marking attendance:', error);
                setLoading(false);
            } finally {
                setMarkingAttendance(false);
                setLoading(false);
            }
        } else if (!isInitialLoading) {
            alert("You must be within the attendance area to mark attendance.");
            setLoading(false);
        }
    };

    // Return loading or error message while Google Maps is loading or if there's an error
    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading maps</div>;

    // Return the attendance UI
    return (
        <div className="relative mb-2">
            {/* Navbar component with signer address */}
            <Navbar signerAddress={signerAddress} />

            {/* Render Loading overlay */}
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <img src={loadinggif} alt="Loading..." className="h-28" />
                    <p className="text-white ml-3">Please wait for the transaction to be successful...</p>
                </div>
            )}

            {/* Back button */}
            <div className="flex items-center">
                <Link to="/token-claimmableeventlist" className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center">
                    <FiArrowLeft className="h-5 w-5 mr-1" /> Back to Attended Events
                </Link>
            </div>

            {/* Title */}
            <h3 className="text-xl lg:text-4xl font-bold text-center text-[#0b287b] mt-4 mb-6">Please ensure that you mark your attendance before proceeding to claim tokens</h3>

            {/* Map and attendance UI */}
            <div className="flex flex-col items-center justify-center">
                {/* Google Maps component */}
                <div className="w-full h-[24rem] lg:h-[30rem] 2xl:h-[40rem] sm:w-full md:w-3/4 lg:w-2/3 mx-auto mt-4 rounded">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        zoom={17}
                        center={currentLocationRef.current}
                    >
                        {/* User marker */}
                        <Marker position={currentLocationRef.current} />
    
                        {/* Attendance area circle */}
                        {venueArea && (
                            <Circle
                                center={venueArea.center}
                                radius={venueArea.radius}
                                options={{
                                    strokeColor: '#FF0000',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 2,
                                    fillColor: '#FF0000',
                                    fillOpacity: 0.35,
                                }}
                            />
                        )}
                    </GoogleMap>
                </div>
    
                {/* Attendance information */}
                <div className="mt-4 text-center">
                    {/* Remaining time */}
                    <p>Time remaining to take attendance: {formatRemainingTime(timer)}</p>
    
                    {/* Attendance buttons */}
                    {attendanceMarked || markingAttendance || isAttendanceDue ? (
                        <button
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg mt-2 cursor-not-allowed"
                            disabled
                        >
                            {isAttendanceDue && !attendanceMarked ? 'Attendance Due' : 'Attendance Recorded'}
                        </button>
                    ) : (
                        <button
                            onClick={handleTakeAttendance}
                            className={`bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 ${isInitialLoading || timer <= 0 || markingAttendance || attendanceMarked || isAttendanceDue ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isInitialLoading || timer <= 0 || markingAttendance || attendanceMarked || isAttendanceDue}
                        >
                            {markingAttendance ? 'Recording Attendance...' : isInitialLoading ? 'Loading...' : 'Take Attendance'}
                        </button>
                    )}
    
                    {/* Claim tokens button */}
                    <div className="mt-4">
                        <Link to={`/claim/${eventId}`} className="text-blue-500 text-sm font-medium">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-1">
                                Claim Tokens
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
    
};

// Function to format remaining time
const formatRemainingTime = (remainingTime) => {
    if (remainingTime <= 0) {
    return '00:00:00';
    }

    const seconds = Math.floor(remainingTime % 60);
    const minutes = Math.floor((remainingTime / 60) % 60);
    const hours = Math.floor(remainingTime / 3600);

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
};	

// Function to pad zero to single digits
const padZero = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
};

export default Attendance;
