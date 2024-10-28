import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { resetPassword } from '../services/college-apis';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = ({ college }) => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        // Simple validation to check if passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // Assuming an endpoint `/api/reset-password` for resetting the password 
            const newCollege = { ...college }
            newCollege.password = password
            console.log("college:", college);
            console.log("newCollege:", newCollege);
            const response = await resetPassword(newCollege);
            console.log(response)


            // Reset successful
            setSuccess("Password reset successfully!");

            navigate('/login', { replace: true });
        } catch (error) {
            console.log(error)
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Row className="w-100">
                <Col xs={12} md={8} lg={5} className="mx-auto">
                    <Card className="shadow p-4">
                        <Card.Body>
                            <h3 className="text-center mb-4">Reset Password</h3>

                            {/* Display success or error messages */}
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}

                            <Form onSubmit={handlePasswordReset}>
                                <Form.Group controlId="formNewPassword" className="mb-3">
                                    <Form.Label>Enter Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter new password"
                                        required
                                        className="py-2"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formConfirmPassword" className="mb-3">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm new password"
                                        required
                                        className="py-2"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 py-2">
                                    Submit Password
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPasswordPage;
