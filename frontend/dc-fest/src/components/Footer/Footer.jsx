import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer bg-dark text-white mt-auto">
            <Container>
                <Row className="justify-content-center py-3">
                    <Col xs={12} className="d-flex flex-column align-items-center">
                        <p className="mb-0">DC_FEST © 2024. All Rights Reserved.</p>
                        <div className="social-icons mt-2">
                            <a href="#!" className="social-icon">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#!" className="social-icon">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#!" className="social-icon">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
