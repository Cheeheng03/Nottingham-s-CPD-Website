import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ setAccountAddress }) {
    const navigate = useNavigate();


        setAccountAddress('');
        navigate('/');


}

export default Logout;
