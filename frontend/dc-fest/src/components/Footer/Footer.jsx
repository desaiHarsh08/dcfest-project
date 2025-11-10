import { Container, Row, Col } from "react-bootstrap";
import "../../styles/Footer.css"; // Assuming you want custom styling
import { useSelector } from "react-redux";
import { selectAcademicYearYear } from "../../app/slices/academicYearSlice";

const Footer = () => {
  const year = useSelector(selectAcademicYearYear);
    return (
        <footer className="footer bg-dark text-light">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} className="d-flex align-items-center justify-content-center">
                        <img
                            src={`${import.meta.env.VITE_APP_PREFIX}/bhawanipur-college-logo.jpg`}
                            alt="Bhawanipur College Logo"
                            className="footer-logo img-fluid me-2" // reduced space between logo and text
                        />
                        <p className="footer-text mb-0">
                            UMANG &copy; {year} | All rights reserved
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;