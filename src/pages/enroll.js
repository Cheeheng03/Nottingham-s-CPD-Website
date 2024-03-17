import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';
import emailjs from "@emailjs/browser";
import { StudentInfoAddress, StudentInfoAbi } from '../Address&Abi/StudentRegistryContract';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'

const provider = new ethers.providers.Web3Provider(window.ethereum);

const Enroll = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [enrollmentInProgress, setEnrollmentInProgress] = useState(false);
	const [signerAddress, setSignerAddress] = useState('');
    const [loading, setLoading] = useState(false); 
    const [emailParams, setEmailParams] = useState({
        email: '',
        studentname: '',
        eventname: '',
        time: '',
        description: ''
    });

    const signer = provider.getSigner();
    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
	const StudentRegistryContract = new ethers.Contract(StudentInfoAddress, StudentInfoAbi, signer);

    useEffect(() => {
        async function fetchEventDetails() {
            try {
                const eventData = await eventRegistryContract.getEvent(eventId);
                setEvent(eventData);
                const userAddress = await signer.getAddress();
                const isEnrolled = await eventRegistryContract.hasEnrolled(eventId, userAddress);
				const studentInfo = await StudentRegistryContract.getStudentInfoByAddress(userAddress);
                setEnrolled(isEnrolled);
                
                // Update emailParams with fetched event information
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

        if (eventId) {
            fetchEventDetails();
        }

        emailjs.init("IubfEuLnET42uLPrA");

		async function fetchSignerAddress() {
			try {
			  // Example: Fetching signer address from your provider
			  const signer = provider.getSigner();
			  const address = await signer.getAddress();
			  setSignerAddress(address);
			} catch (error) {
			  console.error('Error fetching signer address:', error);
			}
		  }
	  
		  fetchSignerAddress();
    }, [eventId, signer, eventRegistryContract]);

    async function enrollStudent() {
		try {
			setEnrollmentInProgress(true);
            setLoading(true);
            const transaction = await eventRegistryContract.enrollStudent(event.eventId);
            await transaction.wait();
			setLoading(false);
			console.log('Enrolled successfully!');
			alert('Enrolled successfully!'); 

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
    
    if (!event) {
        return <div>Loading...</div>;
    }

    return (
        <div className="relative">
            <Navbar signerAddress={signerAddress} />
            {loading && (
					<div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
						<div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-gray-200"></div>
						<p className="text-white ml-3">Please wait for the transaction to be successful...</p>
					</div>
    		)}
            <div className="flex items-center">
                <Link
                    to="/studentevents"
                    className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center"
                >
                    <FiArrowLeft className="h-5 w-5 mr-1" />
                    Back to Event List
                </Link>
            </div>

            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
                {event.name}
            </h3>
            <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
                <img
                    src={`${event.ipfsHash}`}
                    alt={event.name}
                    className="w-full h-96 object-cover mb-4 rounded-lg"
                />
                <p className="text-lg font-semibold text-gray-800">
                    Event ID: {event.eventId.toString()}
                </p>
                <p className="mt-1 text-gray-600">Name: {event.name}</p>
                <p className="mt-1 text-gray-600">
                    Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}
                </p>
                <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                <p className="mt-1 text-gray-600">Description: {event.description}</p>

				{enrolled ? (
					<button
						className="mt-4 bg-gray-400 text-white font-semibold px-4 py-2 rounded cursor-not-allowed"
						disabled
					>
						Enrolled
					</button>
				) : (
					<button
						onClick={enrollStudent}
						// className="mt-4 bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
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
