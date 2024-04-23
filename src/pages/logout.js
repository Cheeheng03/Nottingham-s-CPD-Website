/*
 * Source code written by SEGP Group P
 * Logout component for handling user logout functionality for Nottingham s-CPD website 
 * External libraries used: react, react-router-dom
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    // Initialize navigation hook
    const navigate = useNavigate();

    // Effect to navigate to the home page upon component mount
    useEffect(() => {
        navigate('/');
    }, [navigate]);

    // Render nothing (component is used for side effect only)
    return null;
}

export default Logout;
