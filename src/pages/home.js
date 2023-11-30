import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const fetchEvents = async () => {
    return [
        { title: "Celebrating Women in STEM", date: "2023-12-01", time: "18:00", location: "Grand Hall", poster: "images/women.jpg" },
        { title: "Women in STEM", date: "2023-12-05", time: "10:00", location: "F3C04", poster: "images/women_in_stem.jpg" },
        { title: "Women in STEM", date: "2023-12-10", time: "14:00", location: "F1A15", poster: "images/women_in_stem.jpg" },
        { title: "Women in STEM", date: "2023-12-12", time: "16:00", location: "TCR", poster: "images/women_in_stem.jpg" },
    ];
};

function Home() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchEvents().then(data => {
            setEvents(data);
        });
    }, []);

    return (
        <div>
            <Navbar />
            <div className="container mx-auto mt-12">
                {/* Major Event Section */}
                {events.length > 0 && (
                 <div className="block bg-white rounded-xl overflow-hidden shadow-lg mb-8">
                    <img src={events[0].poster} alt={events[0].title} className="w-full object-cover h-60" />
                        <div className="p-4">
                            <h2 className="font-bold text-2xl text-[#002D74] mb-2">Featured Event: {events[0].title}</h2>
                            <p className="text-gray-700 text-base">Date: {events[0].date}</p>
                            <p className="text-gray-700 text-base">Time: {events[0].time}</p>
                            <p className="text-gray-700 text-base">Location: {events[0].location}</p>
                        </div>
                 </div>
            )}

            {/* Ongoing Events List */}
            <h1 className="font-bold text-3xl text-[#002D74] mb-6">Ongoing Events</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.slice(1).map(event => (
                        <div key={event.title} className="block bg-white rounded-xl shadow-lg overflow-hidden">
                            <img src={event.poster} alt={event.title} className="w-full object-cover h-40" />
                            <div className="p-4">
                                <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                                <p className="text-gray-700 text-base">Date: {event.date}</p>
                                <p className="text-gray-700 text-base">Time: {event.time}</p>
                                <p className="text-gray-700 text-base">Location: {event.location}</p>
                            </div>
                        </div>
                ))}
                </div>
            </div>
        </div>
    );
}

export default Home;
