// src/components/college-desk/AddParticipantModal.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AddParticipantModal = ({ show, handleClose, handleAdd }) => {
    const [participant, setParticipant] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setParticipant({ ...participant, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAdd(participant);
        setParticipant({ name: '', email: '', phone: '' }); // Reset the form
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Participant</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formParticipantName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={participant.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formParticipantEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={participant.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formParticipantPhone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone"
                            value={participant.phone}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Link variant="primary" type="submit">
                        Add Participant
                    </Link>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddParticipantModal;
