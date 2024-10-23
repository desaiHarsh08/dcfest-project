import { useContext, useState } from "react";
import { Navbar as RBNavbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../styles/Navbar.css";
import { AuthContext } from "../../providers/AuthProvider";

const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const authContext = useContext(AuthContext);
  
  return (
    <RBNavbar
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      expand="lg"
      bg="light"
      variant="light"
      className="border-bottom shadow-sm"
    >
      <Container>
        <Link to="/" className="navbar-brand ms-2 fs-5 font-bold">
          DC_FEST
        </Link>
        <RBNavbar.Toggle aria-controls="navbar-default" />
        <RBNavbar.Collapse id="navbar-default">
          <Nav className="ms-auto">
            {authContext?.user && authContext?.user?.type !== "COLLEGE_REPRESENTATIVE" && (
              <>
                <Link to="/home" className="nav-link-custom">
                  Home
                </Link>
                <Link to="settings" className="nav-link-custom">
                  Settings
                </Link>
              </>
            )}
            {!authContext?.user ? (
              <Link to="/login" className="nav-link-custom">
                Login
              </Link>
            ) : (
              <Link to="/" className="nav-link-custom">
                Logout
              </Link>
            )}
          </Nav>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
};

export default Navbar;
