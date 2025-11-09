/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { Navbar as RBNavbar, Nav, Container, Modal, Button } from "react-bootstrap";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaHome, FaCog, FaSignInAlt, FaSignOutAlt, FaBook } from "react-icons/fa";
import "../../styles/Navbar.css";
import "../../styles/GuidelinesModal.css"; // Import custom styles
import { AuthContext } from "../../providers/AuthProvider";
import { useSelector } from "react-redux";
import { selectAcademicYearYear } from "../../app/slices/academicYearSlice";
// Guidelines Modal Component
const GuidelinesModal = ({ show, handleClose, year }) => (
  <Modal show={show} onHide={handleClose} size="lg" centered className="flex flex-column justify-content-between">
    <Modal.Header closeButton className="modal-header-custom">
      <Modal.Title className="modal-title-custom">General Guidelines</Modal.Title>
    </Modal.Header>
    <Modal.Body className="modal-body-custom">
      <ul className="guidelines-list">
        <li>All Participants must carry a valid college identity card of their respective colleges. No soft copies will be allowed.</li>
        <li>The organisers shall not reimburse any expenses incurred by any of the colleges.</li>
        <li>Colleges are required to send in one team to represent their college in each of the events.</li>
        <li>If the registered team for the preliminary round qualifies, it must perform in the finals. No substitutions will be entertained thereafter.</li>
        <li>Cross-college teams or open teams will not be entertained.</li>
        <li>
          Obscenity and vulgarity in any form will lead to disqualification. If the participant feels that any outfit or performance is vulgar, it is strongly advised to consult the organisers before
          the performance. In case of any dispute arising due to this, the organisers&apos; decision will be final and irrevocable.
        </li>
        <li>The decision of the judges or moderators shall be final and binding for all events.</li>
        <li>Chewing pan masala, smoking, drinking, or any other related activity is prohibited in the college premises and other event venues.</li>
        <li>No weapons are allowed on the college premises (including chains, knuckles, pen knives, lighters, etc.). Fire-producing and inflammable objects are strictly prohibited.</li>
        <li>
          All the given pen drives must be named and labeled with their respective IC codes. The files must be in audio format. Management shall not be responsible for any problems related to the
          same.
        </li>
        <li>The management shall not be responsible for any loss, damage, theft, etc. of your personal belongings.</li>
        <li>Damaging or tampering with any kind of college property by anyone shall be considered a serious offense and may lead to cancellation of the college&apos;s participation.</li>
        <li>The prop list and song/track list must be submitted in Umang {year}&apos;s final representative meeting. Not submitting any of the above will result in disqualification.</li>
        <li>Organisers reserve the right to modify the rules and regulations (if required).</li>
        <li>On-the-Spot Entry (OTSE) is subject to availability of slots.</li>
        <li>Undergraduate and Postgraduate students are eligible to participate in Umang {year}.</li>
        <li>Rights to admission is reserved.</li>
        <li>Any student may be asked to leave the venue or campus for disciplinary concern at the discretion of the college management.</li>
      </ul>
    </Modal.Body>
    <Modal.Footer className="modal-footer-custom ">
      <Button variant="secondary" onClick={handleClose} className="modal-close-btn">
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

// Registration Rules Modal Component
const RegistrationRulesModal = ({ show, handleClose, year }) => (
  <Modal show={show} onHide={handleClose} size="lg" centered>
    <Modal.Header closeButton className="modal-header-custom">
      <Modal.Title className="modal-title-custom">Registration Rules</Modal.Title>
    </Modal.Header>
    <Modal.Body className="modal-body-custom">
      <ul className="guidelines-list">
        <li>All the participating colleges will have to register for all the events online through the website—</li>
        <li>Events having restrictions on the maximum number of participants/teams shall be accepted on a first-come, first-served basis.</li>
        <li>The last date for online registrations is 8th December {year}.</li>
        <li>Once the event registration is over, if a college team backs out from any event on the main day, then it will lead to negative marking.</li>
        <li>Participants must report to the registration desk two hours prior to the event.</li>
        <li>The Registration Desk will close 45 minutes before the scheduled time for registered teams and 30 minutes before for OTSE.</li>
      </ul>
    </Modal.Body>
    <Modal.Footer className="modal-footer-custom">
      <Button variant="secondary" onClick={handleClose} className="modal-close-btn">
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

const Navbar = () => {
  const { pathname } = useLocation();
  const { iccode } = useParams();
  const year = useSelector(selectAcademicYearYear);

  const [expanded, setExpanded] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [showRegistrationRulesModal, setShowRegistrationRulesModal] = useState(false);
  const authContext = useContext(AuthContext);

  const handleGuidelinesOpen = () => setShowGuidelinesModal(true);
  const handleGuidelinesClose = () => setShowGuidelinesModal(false);
  const handleRegistrationRulesOpen = () => setShowRegistrationRulesModal(true);
  const handleRegistrationRulesClose = () => setShowRegistrationRulesModal(false);

  return (
    <>
      <RBNavbar
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        expand="lg"
        bg="light"
        variant="light"
        className="border-bottom shadow-sm"
        // style={{height:"60px"}}
      >
        <Container>
          <div className="navbar-brand ms-2 fs-5 font-bold d-flex align-items-center">
            <img
              src={`${import.meta.env.VITE_APP_NODE_ENV === "production" ? import.meta.env.VITE_APP_PREFIX : ""}/U25.png`}
              alt="UMANG Logo"
              className="logo-img me-2"
              style={{
                borderRadius: "50%",
                width: "80px",
                height: "80px",
                objectFit: "cover",
              }}
            />
            {/* <span>NEXUS 2025</span> */}
          </div>
          <RBNavbar.Toggle aria-controls="navbar-default" style={{ background: "none" }} />
          <RBNavbar.Collapse id="navbar-default">
            <Nav className="ms-auto text-decoration-none">
              {authContext?.user && authContext?.user?.type !== "COLLEGE_REPRESENTATIVE" && (
                <>
                  <Link
                    to={iccode ? `/${iccode}` : "/home"}
                    style={{
                      background: pathname.endsWith(`/home`) || pathname.endsWith(`/home/`) ? "aliceblue" : "",
                    }}
                    className={`${pathname.endsWith(`/home`) || pathname.endsWith(`/home/`) ? "border" : ""} nav-link-custom text-decoration-none d-flex py-0 my-0 align-items-center`}
                  >
                    <FaHome className="me-1" /> Home
                  </Link>
                  {authContext && authContext?.user?.type == "ADMIN" && (
                    <Link to={iccode ? `/${iccode}/settings` : "/home/settings"} className="nav-link-custom text-decoration-none d-flex align-items-center">
                      <FaCog className="me-1" /> Settings
                    </Link>
                  )}
                </>
              )}
              <Button variant="link" onClick={handleGuidelinesOpen} className="nav-link-custom text-decoration-none d-flex align-items-center">
                <FaBook className="me-1" /> General Guidelines
              </Button>
              <Button variant="link" onClick={handleRegistrationRulesOpen} className="nav-link-custom text-decoration-none d-flex align-items-center">
                <FaBook className="me-1" /> Registration Rules
              </Button>
              {!authContext?.user ? (
                <Link
                  to="/login"
                  className="nav-link-custom text-decoration-none d-flex align-items-center"
                  style={{
                    fontSize: "1.36rem",
                    background: "cornflowerblue",
                    borderRadius: "12px",
                    color: "white",
                  }}
                >
                  <FaSignInAlt className="me-1" /> Login
                </Link>
              ) : (
                <Link to="/" className="nav-link-custom text-decoration-none d-flex align-items-center">
                  <FaSignOutAlt className="me-1" /> Logout
                </Link>
              )}
            </Nav>
          </RBNavbar.Collapse>
        </Container>
      </RBNavbar>

      {/* Guidelines Modal */}
      <GuidelinesModal show={showGuidelinesModal} handleClose={handleGuidelinesClose} year={year} />

      {/* Registration Rules Modal */}
      <RegistrationRulesModal show={showRegistrationRulesModal} handleClose={handleRegistrationRulesClose} year={year} />
    </>
  );
};

export default Navbar;
