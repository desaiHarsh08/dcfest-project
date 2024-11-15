/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Card, Col, Row, Form } from "react-bootstrap";
import CollegeRepForm from "./CollegeRepForm";
import { updateCollege } from "../../services/college-apis";
import { fetchUserByEmail } from "../../services/user-api";
import { createCollegeRep } from "../../services/college-rep-apis";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { selectResetPasswordFlag, setFlag } from "../../app/slices/resetPasswordOneTimeSlice";
import { setCollege as reduxSetCollege } from '../../app/slices/collegeSlice'

const BasicDetailsForm = ({ college, setCollege, getCollege, setShowResetPasswordForm }) => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    console.log(college);
  }, [college]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([
    {
      name: "",
      email: "",
      password: "",
      phone: "",
      type: "COLLEGE_REPRESENTATIVE",
      collegeId: 0,
      whatsappNumber: "",
      emailVerified: false,
      phoneVerified: false,
      whatsappNoVerfied: false,
    },
    {
      name: "",
      email: "",
      password: "",
      phone: "",
      type: "COLLEGE_REPRESENTATIVE",
      collegeId: 0,
      whatsappNumber: "",
      emailVerified: false,
      phoneVerified: false,
      whatsappNoVerfied: false,
    },
  ]);

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

  const updateCollegeDetails = async () => {
    console.log(college);
    try {
      const response = await updateCollege(college);
      console.log("college update response:", response);
    } catch (error) {
      console.log(error);
    }
  };

  //   const createCollegeRepresentative = async (user) => {
  //     try {
  //       const response = await createUser(user);
  //       console.log("create user response:", response);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("in submit, college:", college);
    console.log("in submit, college:", users);
    if (users.some((user) => user.emailVerified === false) || !college) {
      return;
    }

    let uniqueUserEmails = false;
    // Both the users should have unique emails
    if (users[0].email.trim().toLowerCase() == users[1].email.trim().toLowerCase()) {
      uniqueUserEmails = true;
      alert("College representative should have unique email addresses");

      return;
    }
    // Check from db
    // for (let i = 0; i < users.length; i++) {
    //   let email = users[i].email;
    // //   try {
    // //     const response = await fetchUserByEmail(email);
    // //     console.log(response);
    // //     uniqueUserEmails = false;
    // //     setUsers(
    // //       users.map((user) => {
    // //         if (user.email === email) {
    // //           return { ...user, emailVerified: false };
    // //         }
    // //         return user;
    // //       })
    // //     );
    // //     alert(`Email already exist: ${email}`);
    // //     break;
    // //   } catch (error) {
    // //     console.log(error);
    // //     if (error.response.status === 404) {
    // //       uniqueUserEmails = true;
    // //       console.log(email);
    // //     }
    // //   }
    // }
    // if (!uniqueUserEmails) {
    //   return;
    // }

    try {
      await updateCollegeDetails();
      for (let i = 0; i < users.length; i++) {
        const collegeRepObj = {
          collegeId: college?.id,
          name: users[i].name,
          email: users[i].email,
          phone: users[i].phone,
          whatsappNumber: users[i].whatsappNumber,
        };
        await createCollegeRepresentative(collegeRepObj);
      }
      //   for (let i = 0; i < users.length; i++) {
      //     const tmpUser = {
      //       name: users[i]?.name,
      //       email: users[i]?.email,
      //       password: college?.rp,
      //       phone: users[i]?.phone,
      //       type: "COLLEGE_REPRESENTATIVE",
      //       collegeId: college?.id,
      //       whatsappNumber: users[i]?.whatsappNumber,
      //     };
      //     await createCollegeRepresentative(tmpUser);
      //   }
      alert("Details saved successfully...!");
      dispatch(reduxSetCollege(college))
      dispatch(setFlag());
      dispatch(setCollege(college));
      setFlag(true);
      ;
    } catch (error) {
      console.log(error);
    //   alert("Unable to save the college");
    }
    navigate("/reset-password")
    setLoading(false);
  };

  const createCollegeRepresentative = async (collegeRepObj) => {
    try {
      const response = await createCollegeRep(collegeRepObj);
      console.log("Created rep:", response);
    } catch (error) {
      alert("Some error occured!");
      console.log("Unable to add college rep!", error);
    }
  };

  return (
    <div className="container">
      <Card className="shadow-lg p-4 mt-5 form-card overflow-auto">
        <h2 className="text-center mb-4 form-title">College Registration</h2>
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-3 section-title">College Details</h4>
          <Form.Group controlId="collegeName" className="mb-3">
            <Form.Label>College Name</Form.Label>
            <Form.Control type="text" name="name" value={college?.name} style={{ background: "aliceblue" }} placeholder="Enter college name" required />
          </Form.Group>

          <Form.Group controlId="collegeAddress" className="mb-3">
            <Form.Label>College Address</Form.Label>
            <Form.Control type="text" name="address" value={college?.address} onChange={handleInputChange} placeholder="Enter college address" required />
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Row>
              <Col md={9} xs={8}>
                <Form.Control type="email" name="email" value={college?.email} onChange={handleInputChange} placeholder="Enter email" required />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group controlId="icCode" className="mb-3">
            <Form.Label>IC Code</Form.Label>
            <Form.Control type="text" name="icCode" value={college?.icCode} style={{ background: "aliceblue" }} placeholder="Enter IC Code" required />
          </Form.Group>

          <Form.Group controlId="phone" className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Row>
              <Col md={9} xs={8}>
                <Form.Control type="tel" name="phone" isCollege={true} value={college?.phone} onChange={handleInputChange} placeholder="Enter number" required />
              </Col>
            </Row>
          </Form.Group>

          {/* College Representative Details 1 */}
          <h4 className="mt-4 mb-3 section-title">College Representative 1</h4>
          {users.map((user, index) => (
            <>
              {index === 1 && <h4 className="mt-4 mb-3 section-title">College Representative 2</h4>}
              <CollegeRepForm key={`user-${index}`} onChange={(e) => handleUserChange(e, index)} index={index} user={user} users={users} setUsers={setUsers} />
            </>
          ))}

          <Button disabled={users.some((user) => user.emailVerified === false)} variant="primary" type="submit" className="mt-4">
            {loading ? "Please wait..." : "Submit"}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default BasicDetailsForm;
