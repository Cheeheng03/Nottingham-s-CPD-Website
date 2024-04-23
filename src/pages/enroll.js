/*
 * Source code written by SEGP Group P
 * Enroll component for enrolling students for  Nottingham s-CPD website
 * External libraries used: react, react-router-dom, ethers
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';
import emailjs from "@emailjs/browser";
import loadinggif from '../Images/loading.gif';
import { StudentInfoAddress, StudentInfoAbi } from '../Address&Abi/StudentRegistryContract';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'


const Enroll = () => {
    // Retrieve event ID from URL parameters
    const { eventId } = useParams();
    // State to store event details
    const [event, setEvent] = useState(null);
    // State to track enrollment status
    const [enrolled, setEnrolled] = useState(false);
    // State to track enrollment process
    const [enrollmentInProgress, setEnrollmentInProgress] = useState(false);
    // State to store signer's Ethereum address
	const [signerAddress, setSignerAddress] = useState('');
    // State to track loading state
    const [loading, setLoading] = useState(false);
    // State to store email parameters
    const [emailParams, setEmailParams] = useState({
        email: '',
        studentname: '',
        eventname: '',
        time: '',
        description: ''
    });

    // Ethereum provider and signer setup
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    // Ethereum contract instances
    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
	const StudentRegistryContract = new ethers.Contract(StudentInfoAddress, StudentInfoAbi, signer);

    // Fetch event details and user enrollment status on component mount
    useEffect(() => {
        // Function to fetch event details
        async function fetchEventDetails() {
            try {
                const eventData = await eventRegistryContract.getEvent(eventId);
                setEvent(eventData);
                const userAddress = await signer.getAddress();
                const isEnrolled = await eventRegistryContract.hasEnrolled(eventId, userAddress);
				const studentInfo = await StudentRegistryContract.getStudentInfoByAddress(userAddress);
                setEnrolled(isEnrolled);
                
                // Set email parameters based on user and event details
                setEmailParams({
                    studentname: studentInfo[1],
                    email: studentInfo[2],
                    eventname: eventData.name,
                    time: new Date(eventData.time.mul(1000).toNumber()).toLocaleString(),
                    description: eventData.description
                });

            } catch (error) {
                console.error('Error fetching event details:', error);
            }
        }

        // Fetch event details if event ID is available
        if (eventId) {
            fetchEventDetails();
        }

        // Initialize EmailJS
        emailjs.init("IubfEuLnET42uLPrA");

        // Function to fetch signer's Ethereum address
		async function fetchSignerAddress() {
			try {
			  const signer = provider.getSigner();
			  const address = await signer.getAddress();
			  setSignerAddress(address);
			} catch (error) {
			  console.error('Error fetching signer address:', error);
			}
		}
	  
		// Fetch signer's Ethereum address
		fetchSignerAddress();
    }, [eventId, signer, eventRegistryContract]);

    // Function to enroll a student in the event
    async function enrollStudent() {
		try {
			setEnrollmentInProgress(true);
            setLoading(true);
            const transaction = await eventRegistryContract.enrollStudent(event.eventId);
            await transaction.wait();
			setLoading(false);
			console.log('Enrolled successfully!');
			alert('Enrolled successfully!'); 

			// Send confirmation email using EmailJS
			await emailjs.send('service_yk80258', 'template_nlhimtj', emailParams)
			.then((response) => {
				console.log('Confirmation email sent successfully!', response.status, response.text);
			})
			.catch((error) => {
				console.error('Confirmation email failed to send', error);
				throw new Error('EmailJS Error: ' + error);
			});
			setEnrolled(true); 
		} catch (error) {
			console.error('Error enrolling:', error);
            setEnrollmentInProgress(false);
            setLoading(false);
		} 
	}
    
    // Render loading indicator if event details are not yet fetched
    if (!event) {
        return <div>Loading...</div>;
    }

    // Render the Enroll component UI
    return (
        <div className="relative">
            {/* Render Navbar component with signer address */}
            <Navbar signerAddress={signerAddress} />

            {/* Render loading overlay when transaction is in progress */}
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <img src={loadinggif} alt="Loading..." className="h-28" />
                    <p className="text-white ml-3">Please wait for the transaction to be successful...</p>
                </div>
            )}

            {/* Render Back button */}
            <div className="flex items-center">
                <Link to="/eventenrollmentlist" className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center">
                    <FiArrowLeft className="h-5 w-5 mr-1" />
                    Back to Event Enrollment List
                </Link>
            </div>

            {/* Render event details */}
            <h3 className="text-2xl lg:text-4xl font-bold text-center text-[#0b287b] mt-4 mb-8">{event.name}</h3>
            <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
                <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-60 lg:h-96 object-cover mb-4 rounded-lg" />
                <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                <p className="mt-1 text-gray-600">Name: {event.name}</p>
                <p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
                <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                <p className="mt-1 text-gray-600">Description: {event.description}</p>

                {/* Render enrollment button */}
				{enrolled ? (
					<button className="mt-4 bg-gray-400 text-white font-semibold px-4 py-2 rounded cursor-not-allowed" disabled>
						Enrolled
					</button>
				) : (
					<button
						onClick={enrollStudent}
						className={`mt-4 ${enrollmentInProgress ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:bg-blue-600'} text-white font-semibold px-4 py-2 rounded`}
						disabled={enrollmentInProgress}
					>
						{enrollmentInProgress ? 'Enrolled' : 'Enroll'}
					</button>
				)}

            </div>
        </div>
    );
};

export default Enroll;
