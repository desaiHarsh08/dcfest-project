import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import "../styles/Login.css"; // Custom styles for any additional styling
import { useNavigate } from "react-router-dom";
import { doLogin } from "../services/auth-apis";
import { fetchCollegeById } from "../services/college-apis";
import { FiLock, FiUser } from "react-icons/fi";
const Login = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(credentials);

    if (credentials.username.trim() === "" || credentials.password.trim() === "") {
      return;
    }

    try {
      const { accessToken, user } = await doLogin({...credentials, year: 2025});
      console.log(accessToken, user);
      if (!user?.type || user?.type === "COLLEGE_REPRESENTATIVE") {
        try {
          const res = await fetchCollegeById(user?.collegeId || user?.id);
          console.log("college: ", res);
          navigate(`/${res.icCode}`, { replace: true });
        } catch (error) {
          console.log(error);
          alert("Unable to do login... Please try again...!");
        }
      } else {
        if (user?.disabled == true) {
          alert("Your account has been suspended. Please contact the host college!");
        } else {
          navigate(`/home`, { replace: true });
        }
      }
    } catch (error) {
      alert("Please provide the valid credentials!");
      console.log(error);
    }
  };

  return (
    <Container fluid className="login-page">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={5}>
          <Card className="shadow-lg p-4 card-login">
            <Card.Body>
              <h3 className="text-center mb-4">Welcome to UMANG 2024</h3>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicusername" className="mb-3">
                  <Form.Label>
                    <FiUser />
                    Enter Username :-
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="Enter Username"
                    className="border"
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mb-3">
                  <Form.Label>
                    <FiLock />
                    Enter Password :-
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter Password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="border"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Sign In
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
