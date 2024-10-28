import React, { useState } from 'react';
import { Card, Button, Container } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/CollegeGreetings.css';

const CollegeGreetings = () => {
    const [visible, setVisible] = useState(true);
    const navigate = useNavigate();

    const handleButtonClick = () => {
        setVisible(false);
        navigate('/login'); // Navigate to the login page
    };

    if (!visible) return null;

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="text-center p-4 shadow-lg success-card">
                <FaCheckCircle className="icon mb-3" />
                <h5 className="success-title">Success!</h5>
                <p className="success-message">College basic details saved successfully!</p>
                <Button variant="outline-success" onClick={handleButtonClick} className="confirm-button mt-3">
                    Okay
                </Button>
            </Card>
        </Container>
    );
};

export default CollegeGreetings;
