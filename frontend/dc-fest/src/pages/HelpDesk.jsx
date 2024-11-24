// HelpDesk.js
import React, { useState, useRef, useEffect } from 'react';
import {
    Container,
    Table,
    Button,
    Modal,
    Form,
    Tabs,
    Tab,
    Row,
    Col,
    InputGroup,
    FormControl,
} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid'; // For unique ID generation
import { useNavigate } from 'react-router-dom';

const HelpDesk = () => {
    // Refs for file inputs
    const fileInputParticipants = useRef(null);
    const fileInputRepresentatives = useRef(null);
    const navigate = useNavigate();
    // State for Participants and Representatives (initialized as empty arrays)
    const [participants, setParticipants] = useState([]);
    const [representatives, setRepresentatives] = useState([]);

    // State for Search Queries
    const [participantSearch, setParticipantSearch] = useState('');
    const [representativeSearch, setRepresentativeSearch] = useState('');

    // Common state for modals
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentSection, setCurrentSection] = useState('participants'); // 'participants' or 'representatives'

    // Handlers for opening modals
    const handleEditClick = (item, section) => {
        setCurrentItem(item);
        setCurrentSection(section);
        setShowEditModal(true);
    };

    const handleDeleteClick = (item, section) => {
        setCurrentItem(item);
        setCurrentSection(section);
        setShowDeleteModal(true);
    };

    // Handlers for closing modals
    const handleEditModalClose = () => {
        setShowEditModal(false);
        setCurrentItem(null);
        setCurrentSection('participants');
    };

    const handleDeleteModalClose = () => {
        setShowDeleteModal(false);
        setCurrentItem(null);
        setCurrentSection('participants');
    };

    // Handler for deleting an item
    const handleDelete = () => {
        if (currentSection === 'participants') {
            setParticipants(participants.filter((p) => p.id !== currentItem.id));
        } else if (currentSection === 'representatives') {
            setRepresentatives(representatives.filter((r) => r.id !== currentItem.id));
        }
        handleDeleteModalClose();
    };

    // Handler for editing an item
    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (currentSection === 'participants') {
            setParticipants(
                participants.map((p) =>
                    p.id === currentItem.id ? currentItem : p
                )
            );
        } else if (currentSection === 'representatives') {
            setRepresentatives(
                representatives.map((r) =>
                    r.id === currentItem.id ? currentItem : r
                )
            );
        }
        handleEditModalClose();
    };

    // Handler for input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({ ...currentItem, [name]: value });
    };

    // Handler for file uploads
    const handleFileUpload = (e, section) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;

        reader.onload = (event) => {
            try {
                const bstr = event.target.result;
                const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (data.length === 0) {
                    alert('The uploaded Excel file is empty.');
                    return;
                }

                // Remove the header row
                const headers = data.shift();

                // Validate headers
                let requiredHeaders = [];
                if (section === 'participants') {
                    requiredHeaders = ['Name', 'Email', 'Role', 'College Name', 'Event Participation'];
                } else if (section === 'representatives') {
                    requiredHeaders = ['Name', 'Email', 'Department', 'College Name', 'Event Participation'];
                }

                const isValid = requiredHeaders.every(
                    (header, index) => header.toLowerCase() === (headers[index] || '').toLowerCase()
                );

                if (!isValid) {
                    alert(`Invalid file format for ${section}. Please ensure the headers are correct.`);
                    return;
                }

                // Map data to objects with unique IDs
                const newEntries = data.map((row) => {
                    const entry = {};
                    if (section === 'participants') {
                        entry.id = uuidv4();
                        entry.name = row[0] ? row[0].toString().trim() : '';
                        entry.email = row[1] ? row[1].toString().trim() : '';
                        entry.role = row[2] ? row[2].toString().trim() : 'Participant';
                        entry.collegeName = row[3] ? row[3].toString().trim() : '';
                        entry.eventParticipation = row[4] ? row[4].toString().trim() : '';
                    } else if (section === 'representatives') {
                        entry.id = uuidv4();
                        entry.name = row[0] ? row[0].toString().trim() : '';
                        entry.email = row[1] ? row[1].toString().trim() : '';
                        entry.department = row[2] ? row[2].toString().trim() : '';
                        entry.collegeName = row[3] ? row[3].toString().trim() : '';
                        entry.eventParticipation = row[4] ? row[4].toString().trim() : '';
                    }
                    return entry;
                });

                // Optional: Validate data (e.g., email format)
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                for (let entry of newEntries) {
                    if (!emailRegex.test(entry.email)) {
                        alert(`Invalid email format for ${entry.name}: ${entry.email}`);
                        return;
                    }
                }

                // Update state
                if (section === 'participants') {
                    setParticipants([...participants, ...newEntries]);
                } else if (section === 'representatives') {
                    setRepresentatives([...representatives, ...newEntries]);
                }

                alert(`Successfully imported ${newEntries.length} ${section}.`);
            } catch (error) {
                console.error(error);
                alert('An error occurred while processing the file. Please ensure it is a valid Excel file.');
            }
        };

        if (rABS) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsArrayBuffer(file);
        }

        // Reset the input value to allow uploading the same file again if needed
        e.target.value = null;
    };

    // Function to download Excel templates
    const downloadTemplate = (section) => {
        const wb = XLSX.utils.book_new();
        let ws_data = [];

        if (section === 'participants') {
            ws_data = [
                ['Name', 'Email', 'Role', 'College Name', 'Event Participation'],
                // Optional: Add sample data rows if desired
            ];
        } else if (section === 'representatives') {
            ws_data = [
                ['Name', 'Email', 'Department', 'College Name', 'Event Participation'],
                // Optional: Add sample data rows if desired
            ];
        }

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${section}_template.xlsx`);
    };

    // Filtered Lists based on Search Queries
    const filteredParticipants = participants.filter((p) =>
        p.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.role.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.collegeName.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.eventParticipation.toLowerCase().includes(participantSearch.toLowerCase())
    );

    const filteredRepresentatives = representatives.filter((r) =>
        r.name.toLowerCase().includes(representativeSearch.toLowerCase()) ||
        r.email.toLowerCase().includes(representativeSearch.toLowerCase()) ||
        r.department.toLowerCase().includes(representativeSearch.toLowerCase()) ||
        r.collegeName.toLowerCase().includes(representativeSearch.toLowerCase()) ||
        r.eventParticipation.toLowerCase().includes(representativeSearch.toLowerCase())
    );

    return (
        <Container>
            <button
                className="back-button"
                onClick={() => navigate(-1)} // Navigates to the previous page
                style={{
                    margin: "10px",
                    padding: "10px 20px",
                    marginBottom: "30px",
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Back
            </button>
            <h2 className="text-center mt-4">HelpDesk - Event Management</h2>
            <Tabs defaultActiveKey="participants" id="helpdesk-tabs" className="mt-4">
                {/* Participants Tab */}
                <Tab eventKey="participants" title="Participants">
                    <Row className="mt-3">
                        <Col md={4} sm={6} xs={12}>
                            <InputGroup>
                                <FormControl
                                    placeholder="Search Participants"
                                    value={participantSearch}
                                    onChange={(e) => setParticipantSearch(e.target.value)}
                                />
                                <InputGroup.Text>
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                            </InputGroup>
                        </Col>
                        <Col md={8} sm={6} xs={12} className="text-end">
                            <Button
                                variant="info"
                                className="me-2"
                                onClick={() => downloadTemplate('participants')}
                            >
                                Download Template
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => fileInputParticipants.current.click()}
                            >
                                Upload Excel
                            </Button>
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                ref={fileInputParticipants}
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, 'participants')}
                            />
                        </Col>
                    </Row>
                    <Table responsive striped bordered hover className="mt-3">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>College Name</th>
                                <th>Event Participation</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParticipants.length > 0 ? (
                                filteredParticipants.map((participant, index) => (
                                    <tr key={participant.id}>
                                        <td>{index + 1}</td>
                                        <td>{participant.name}</td>
                                        <td>{participant.email}</td>
                                        <td>{participant.role}</td>
                                        <td>{participant.collegeName}</td>
                                        <td>{participant.eventParticipation}</td>
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditClick(participant, 'participants')}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDeleteClick(participant, 'participants')}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        No Participants Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Tab>

                {/* College Representatives Tab */}
                <Tab eventKey="representatives" title="College Representatives">
                    <Row className="mt-3">
                        <Col md={4} sm={6} xs={12}>
                            <InputGroup>
                                <FormControl
                                    placeholder="Search Representatives"
                                    value={representativeSearch}
                                    onChange={(e) => setRepresentativeSearch(e.target.value)}
                                />
                                <InputGroup.Text>
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                            </InputGroup>
                        </Col>
                        <Col md={8} sm={6} xs={12} className="text-end">
                            <Button
                                variant="info"
                                className="me-2"
                                onClick={() => downloadTemplate('representatives')}
                            >
                                Download Template
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => fileInputRepresentatives.current.click()}
                            >
                                Upload Excel
                            </Button>
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                ref={fileInputRepresentatives}
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, 'representatives')}
                            />
                        </Col>
                    </Row>
                    <Table responsive striped bordered hover className="mt-3">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>College Name</th>
                                <th>Event Participation</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRepresentatives.length > 0 ? (
                                filteredRepresentatives.map((rep, index) => (
                                    <tr key={rep.id}>
                                        <td>{index + 1}</td>
                                        <td>{rep.name}</td>
                                        <td>{rep.email}</td>
                                        <td>{rep.department}</td>
                                        <td>{rep.collegeName}</td>
                                        <td>{rep.eventParticipation}</td>
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditClick(rep, 'representatives')}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDeleteClick(rep, 'representatives')}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        No Representatives Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Tab>
            </Tabs>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={handleEditModalClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Edit {currentSection === 'participants' ? 'Participant' : 'Representative'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        {/* Common Fields */}
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentItem?.name || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={currentItem?.email || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>

                        {/* Conditional Fields */}
                        {currentSection === 'participants' ? (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Role</Form.Label>
                                    <Form.Select
                                        name="role"
                                        value={currentItem?.role || 'Participant'}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Participant">Participant</option>
                                        <option value="College Representative">College Representative</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>College Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="collegeName"
                                        value={currentItem?.collegeName || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Event Participation</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="eventParticipation"
                                        value={currentItem?.eventParticipation || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Department</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="department"
                                        value={currentItem?.department || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>College Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="collegeName"
                                        value={currentItem?.collegeName || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Event Participation</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="eventParticipation"
                                        value={currentItem?.eventParticipation || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </>
                        )}

                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleDeleteModalClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Delete {currentSection === 'participants' ? 'Participant' : 'Representative'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete{' '}
                    <strong>{currentItem?.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteModalClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );

};
export default HelpDesk;
