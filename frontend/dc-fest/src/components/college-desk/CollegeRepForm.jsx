import { Col, Form, Row } from "react-bootstrap";
import EmailModal from "./EmailModal";
import PhoneModal from "./PhoneModal";

const CollegeRepForm = ({
  user,
  index,
  onChange,
  setUsers,
  users
}) => {
  return (
    <>
      <Col>
        <Col md={6} xs={12} className="w-100">
          <Form.Group controlId="rep1Name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={user?.name}
              onChange={(e) => onChange(e, index)}
              placeholder="Enter name"
              required
            />
          </Form.Group>
        </Col>

        <Col md={6} xs={12} className="w-100">
          <Form.Group controlId="rep1Email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Col>
              <Col md={9} xs={8}>
                <Form.Control
                  type="email"
                  name="email"
                  value={user?.email}
                  onChange={(e) => onChange(e, index)}
                  placeholder="Enter email"
                  required
                />
              </Col>
              <Col md={6} xs={12}>
                <EmailModal
                  index={index}
                  email={user?.email}
                  setUsers={setUsers}
                  users={users}
                />
              </Col>
            </Col>
          </Form.Group>
        </Col>
      </Col>
      <Row>
        <Col md={6} xs={12} className="w-100">
          <Form.Group controlId="rep1Phone" className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Col>
              <Col md={9} xs={8}>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={user?.phone}
                  onChange={(e) => onChange(e, index)}
                  placeholder="Enter number"
                  required
                />
              </Col>
            </Col>
          </Form.Group>
        </Col>
        <Col md={6} xs={12} className="w-100">
          <Form.Group controlId="rep1Phone" className="mb-3">
            <Form.Label>WhatsApp Number:</Form.Label>
            <Col>
              <Col md={9} xs={8}>
                <Form.Control
                  type="tel"
                  name="whatsappNumber"
                  value={user?.whatsappNumber}
                  onChange={(e) => onChange(e, index)}
                  placeholder="Enter number"
                  required
                />
              </Col>
              <Col md={6} xs={12}>
                <PhoneModal
                  index={index}
                  phone={user?.whatsappNumber}
                  users={users}
                  setUsers={setUsers}
                />
              </Col>
            </Col>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default CollegeRepForm;