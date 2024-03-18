import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import emailjs from '@emailjs/browser';
import Navbar from '../components/Navbar';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract';
import { uploadToIPFS } from '../ipfs';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);

export default function CreateEventForm() {
  const [formState, setFormState] = useState({
    name: '',
    venue: '',
    time: '',
    image: '',
    description: '',
    fileName: '',
  });
  const [signerAddress, setSignerAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emailjs.init("your-emailjs-user-id");

    async function fetchSignerAddress() {
      try {
        const address = await signer.getAddress();
        setSignerAddress(address);
      } catch (error) {
        console.error('Error fetching signer address:', error);
      }
    }

    fetchSignerAddress();
  }, []);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'eventImage') {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState(prevState => ({
          ...prevState,
          image: reader.result.toString(),
          fileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormState(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { name, venue, time, image, description } = formState;
    const eventTime = Math.floor(new Date(time).getTime() / 1000);

    try {
      setLoading(true);
      const ipfsHash = await uploadToIPFS(image);
      const transaction = await eventRegistryContract.createEvent(name, eventTime, venue, ipfsHash, description);
      await transaction.wait();
      alert('Event created successfully');

      const emailParams = { description };
      await emailjs.send('your-emailjs-service-id', 'your-emailjs-template-id', emailParams);
      setLoading(false);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar signerAddress={signerAddress} />
      <h2 className="text-2xl font-bold text-center my-4">Event Creation Form</h2>
      {loading && <LoadingOverlay />}
      <EventForm
        formState={formState}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-gray-200"></div>
      <p className="text-white ml-3">Please wait for the transaction to be successful...</p>
    </div>
  );
}

function EventForm({ formState, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
      {/* Event Name Input */}
      <EventName
        label="Event Name:"
        id="eventName"
        name="name"
        value={formState.name}
        placeholder="Event Name"
        onChange={onChange}
      />

      {/* Event Time Input */}
      <EventDate
        label="Event Date:"
        id="eventDate"
        name="time"
        value={formState.time}
        onChange={onChange}
      />

      {/* Venue Selection */}
      <VenueSelect
        id="eventVenue"
        name="venue"
        value={formState.venue}
        onChange={onChange}
      />

      {/* Event Description Input */}
      <EventDesc
        label="Event Description:"
        id="eventDescription"
        name="description"
        value={formState.description}
        placeholder="Event Description"
        rows="6"
        onChange={onChange}
      />

      {/* Image Upload */}
      <EventPoster
        label="Event Poster:"
        id="eventPoster"
        fileName={formState.fileName}
        image={formState.image}
        onChange={onChange}
      />

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Event
        </button>
      </div>
    </form>
  );
}

function EventName({ label, id, name, value, placeholder, onChange }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  );
}

function EventDate({ label, id, name, value, onChange }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        type="datetime-local"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  );
}

function VenueSelect({ id, name, value, onChange }) {
	return (
	  <div className="mb-4 relative">
		<label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
		  Event Venue:
		</label>
		<div className="flex items-center">
		  <select
			id={id}
			name={name}
			value={value}
			onChange={onChange}
			className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
			style={{backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%23666\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' /></svg>")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat'}}
		  >
			<option value="">Select a venue</option>
			<option value="F1A04">F1A04</option>
			<option value="F1A12">F1A12</option>	
			<option value="F1A13">F1A13</option>
			<option value="F3C04">F3C04</option>
			<option value="F4C02">F4C02</option>
			<option value="BB80">BB80</option>
			<option value="Great Hall">Great Hall</option>
		  </select>
		</div>
	  </div>
	);
  }

function EventDesc({ label, id, name, value, placeholder, rows, onChange }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      ></textarea>
    </div>
  );
}

function EventPoster({ label, id, fileName, image, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <div className="flex items-center justify-between border rounded-md px-4 py-2 bg-gray-100">
        <div>
          <span className="text-gray-500">{fileName || 'Choose a file'}</span>
          {image && <img src={image} alt="Selected Event" className="max-w-xs mt-2" />}
        </div>
        <input
          type="file"
          name="eventImage"
          id={id}
          className="hidden"
          onChange={onChange}
        />
        <label htmlFor={id} className="cursor-pointer text-blue-500 hover:underline">
          Browse
        </label>
      </div>
    </div>
  );
}
