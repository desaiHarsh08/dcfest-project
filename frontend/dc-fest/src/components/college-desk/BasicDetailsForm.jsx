import { useEffect, useState } from "react";
import { Button, Card, Col, Row, Form } from "react-bootstrap";
import "../../styles/BasicDetailsForm.css"; // Import your custom CSS file for additional styling
import CollegeRepForm from "./CollegeRepForm";
import EmailModal from "./EmailModal";
import PhoneModal from "./PhoneModal";
import { createUser } from "../../services/auth-apis";
import { updateCollege } from "../../services/college-apis";

const BasicDetailsForm = ({ college, setCollege }) => {
  useEffect(() => {
    console.log(college);
  }, [college]);

  const [users, setUsers] = useState([
    {
      name: "",
      email: "",
      password: "",
      phone: "",
      type: "COLLEGE_REPRESENTATIVE",
      collegeId: 0,
    },
    {
      name: "",
      email: "",
      password: "",
      phone: "",
      type: "COLLEGE_REPRESENTATIVE",
      collegeId: 0,
    },
  ]);
  const [verifyOtpStatus, setVerifyOtpStatus] = useState({
    emailCollege: false,
    phoneCollege: false,
    email1: false,
    phone1: false,
    email2: false,
    phone2: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCollege((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserChange = (e, index) => {
    const { name, value } = e.target;

    const newUser = users.map((user, idx) => {
      if (idx === index) {
        return { ...user, [name]: value };
      }
      return user;
    });

    setUsers(newUser);
  };

  const isValidData =
    verifyOtpStatus.email1 &&
    verifyOtpStatus.email2 &&
    verifyOtpStatus.emailCollege;

  const updateCollegeDetails = async () => {
    console.log(college);
    try {
      const response = await updateCollege(college);
      console.log("college update response:", response);
    } catch (error) {
      console.log(error);
    }
  };

  const createCollegeRepresentative = async (user) => {
    try {
      const response = await createUser(user);
      console.log("create user response:", response);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("in submit, college:", college);
    if (!isValidData || !college) {
      return;
    }
    try {
      await updateCollegeDetails();
      for (let i = 0; i < users.length; i++) {
        const tmpUser = { ...users[i] };
        tmpUser.collegeId = college?.id;
        await createCollegeRepresentative(tmpUser);
      }
      alert("Details saved successfully...!");
    } catch (error) {
      console.log(error);
      alert("Unable to save the college");
    }
  };

  return (
    <div className="college-desk-container">
      <Card className="shadow-lg p-4 mt-5 form-card overflow-auto">
        <h2 className="text-center mb-4 form-title">
          College Desk Registration
        </h2>
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-3 section-title">College Details</h4>
          <Form.Group controlId="collegeName" className="mb-3">
            <Form.Label>College Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={college?.name}
              placeholder="Enter college name"
              required
            />
          </Form.Group>

          <Form.Group controlId="collegeAddress" className="mb-3">
            <Form.Label>College Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={college?.address}
              onChange={handleInputChange}
              placeholder="Enter college address"
              required
            />
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Row>
              <Col md={9} xs={8}>
                <Form.Control
                  type="email"
                  name="email"
                  value={college?.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                />
              </Col>
              <Col md={3} xs={4}>
                <EmailModal
                  isCollege={true}
                  email={college?.email}
                  verifyOtpStatus={verifyOtpStatus}
                  setVerifyOtpStatus={setVerifyOtpStatus}
                />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group controlId="icCode" className="mb-3">
            <Form.Label>IC Code</Form.Label>
            <Form.Control
              type="text"
              name="icCode"
              value={college?.icCode}
              placeholder="Enter IC Code"
              required
            />
          </Form.Group>

          <Form.Group controlId="phone" className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Row>
              <Col md={9} xs={8}>
                <Form.Control
                  type="tel"
                  name="phone"
                  isCollege={true}
                  value={college?.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  required
                />
              </Col>
              <Col md={3} xs={4}>
                <PhoneModal
                  phone={college?.phone}
                  verifyOtpStatus={verifyOtpStatus}
                  setVerifyOtpStatus={setVerifyOtpStatus}
                />
              </Col>
            </Row>
          </Form.Group>

          {/* College Representative Details 1 */}
          <h4 className="mt-4 mb-3 section-title">
            College Representative Details 1
          </h4>
          {users.map((user, index) => (
            <CollegeRepForm
              key={`user-${index}`}
              onChange={(e) => handleUserChange(e, index)}
              index={index}
              user={user}
              verifyOtpStatus={verifyOtpStatus}
              setVerifyOtpStatus={setVerifyOtpStatus}
            />
          ))}

          <Button
            disabled={!isValidData}
            variant="primary"
            type="submit"
            className="mt-4"
          >
            Submit
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default BasicDetailsForm;
