import { Container, Row, Col } from "react-bootstrap";
import "../../styles/Footer.css"; // Assuming you want custom styling

const Footer = () => {
    return (
        <footer className="footer bg-dark text-light">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} className="d-flex align-items-center justify-content-center">
                        <img
                            src="/bhawanipur-college-logo.jpg"
                            alt="Bhawanipur College Logo"
                            className="footer-logo img-fluid me-2" // reduced space between logo and text
                        />
                        <p className="footer-text mb-0">
                            NEXUS &copy; 2025 | All rights reserved
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;