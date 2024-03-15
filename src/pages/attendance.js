import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import { NOTTAddress, NOTTABI } from '../Address&Abi/NottinghamCoinContract'
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract';

const libraries = ['places'];
const mapContainerStyle = {
  width: '50vw',
  height: '50vh',
};
const initialCenter = {
  lat: 2.9438,
  lng: 101.8734,
};

const Attendance = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [signerAddress, setSignerAddress] = useState('');
    const [venueArea, setVenueArea] = useState(null);
    const currentLocationRef = useRef(initialCenter);
    const [withinAttendanceArea, setWithinAttendanceArea] = useState(false);
    const [timer, setTimer] = useState(0);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const [isAttendanceDue, setIsAttendanceDue] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const { isLoaded, loadError } = useLoadScript({
      googleMapsApiKey: 'AIzaSyB92jFfU2cogCEM03VKTJwNTwXfd_iLH1I',
      libraries,
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
    const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);

    useEffect(() => {
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

        async function fetchEventDetails() {
            try {
                const eventData = await eventRegistryContract.getEvent(eventId);
                setEvent({
                    venue: eventData.venue,
                    starttime: eventData.time,
                });
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

        if (eventId) {
            fetchEventDetails();
        }

        async function fetchSignerAddress() {
            try {
                const address = await signer.getAddress();
                setSignerAddress(address);
            } catch (error) {
                console.error('Error fetching signer address:', error);
            }
        }

        fetchSignerAddress();

        const watchPosition = () => {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            };

            const watcher = navigator.geolocation.watchPosition(
                (position) => {
                    const newPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
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

    }, [eventId, signer, eventRegistryContract]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 2000);
    
        return () => clearTimeout(timer);
    }, []);

    const fetchVenueRadius = (venue) => {
        const areas = {
            "F3C04": { id: "F3", center: { lat: 2.94525, lng: 101.8765 }, radius: 40 },
            "F1A04": { id: "F1", center: { lat: 2.9450556, lng: 101.8756111 }, radius: 60 },
            // "F1A12": { id: "F1", center: { lat: 2.9450556, lng: 101.8756111 }, radius: 60 },
            "F1A12": { id: "F1", center: { lat: 2.943230, lng: 101.877789 }, radius: 60 },
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

    const checkAttendanceArea = (location) => {
        if (venueArea) {
            const distance = getDistanceFromLatLonInM(location.lat, location.lng, venueArea.center.lat, venueArea.center.lng);
            if (distance < venueArea.radius) {
                console.log(`User is within the attendance area: ${venueArea.id}`);
                setWithinAttendanceArea(true);
            } else {
                setWithinAttendanceArea(false);
            }
        }
    };

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

    const handleTakeAttendance = async () => {
        if (!isInitialLoading && withinAttendanceArea && !attendanceMarked && !markingAttendance) {
            setMarkingAttendance(true);
            try {
                await NOTTContract.markAttendance(eventId);
                setAttendanceMarked(true);
                console.log("Attendance marked successfully!");
            } catch (error) {
                console.error('Error marking attendance:', error);
            } finally {
                setMarkingAttendance(false);
            }
        } else if (!isInitialLoading) {
            alert("You must be within the attendance area to mark attendance.");
        }
    };

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading maps</div>;

    return (
        <div className="relative">
            <Navbar signerAddress={signerAddress} />
            <div className="flex items-center">
                <Link to="/claimtoken" className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center">
                    <FiArrowLeft className="h-5 w-5 mr-1" /> Back to Attended Events
                </Link>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div style={mapContainerStyle}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={17}
                        center={currentLocationRef.current}
                    >
                        <Marker position={currentLocationRef.current} />
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
                <div className="mt-4 text-center">
                    <p>Time remaining to take attendance: {formatRemainingTime(timer)}</p>
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

const formatRemainingTime = (remainingTime) => {
	if (remainingTime <= 0) {
	  return '00:00:00';
	}
  
	const seconds = Math.floor(remainingTime % 60);
	const minutes = Math.floor((remainingTime / 60) % 60);
	const hours = Math.floor(remainingTime / 3600);
  
	return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  };	

const padZero = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
};

export default Attendance;
