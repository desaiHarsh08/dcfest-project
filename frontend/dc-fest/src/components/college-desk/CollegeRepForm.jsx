import { Col, Form, Row } from "react-bootstrap";
import EmailModal from "./EmailModal";
import PhoneModal from "./PhoneModal";

const CollegeRepForm = ({
  user,
  index,
  onChange,
  verifyOtpStatus,
  setVerifyOtpStatus,
}) => {
  return (
    <>
      <Row>
        <Col md={6} xs={12}>
          <Form.Group controlId="rep1Name" className="mb-3">
            <Form.Label>Representative Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={user?.name}
              onChange={(e) => onChange(e, index)}
              placeholder="Enter representative's name"
              required
            />
          </Form.Group>
        </Col>

        <Col md={6} xs={12}>
          <Form.Group controlId="rep1Email" className="mb-3">
            <Form.Label>Representative Email</Form.Label>
            <Row>
              <Col md={9} xs={8}>
                <Form.Control
                  type="email"
                  name="email"
                  value={user?.email}
                  onChange={(e) => onChange(e, index)}
                  placeholder="Enter representative's email"
                  required
                />
              </Col>
              <Col md={3} xs={4}>
                <EmailModal
                  index={index}
                  email={user?.email}
                  verifyOtpStatus={verifyOtpStatus}
                  setVerifyOtpStatus={setVerifyOtpStatus}
                />
              </Col>
            </Row>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6} xs={12}>
          <Form.Group controlId="rep1Phone" className="mb-3">
            <Form.Label>Representative Phone</Form.Label>
            <Row>
              <Col md={9} xs={8}>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={user?.phone}
                  onChange={(e) => onChange(e, index)}
                  placeholder="Enter representative's phone number"
                  required
                />
              </Col>
              <Col md={3} xs={4}>
                <PhoneModal
                  index={index}
                  phone={user?.phone}
                  verifyOtpStatus={verifyOtpStatus}
                  setVerifyOtpStatus={setVerifyOtpStatus}
                />
              </Col>
            </Row>
          </Form.Group>
        </Col>

        <Col md={6} xs={12}>
          <Form.Group controlId="rep1Password" className="mb-3">
            <Form.Label>Representative Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={user?.password}
              onChange={(e) => onChange(e, index)}
              placeholder="Enter representative's password"
              required
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default CollegeRepForm;
