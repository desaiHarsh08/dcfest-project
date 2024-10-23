import { Col, Row, Table } from "react-bootstrap";
import CollegeRow from "./CollegeRow";

const CollegeList = ({ colleges, setColleges }) => {
  if (colleges?.length === 0) {
    return <p className="text-center my-5">No college has registed!</p>;
  }

  const handleChange = (e, index) => {};

  return (
    <Row className="mt-5 justify-content-center">
      <Col md={10}>
        <h2 className="text-center mb-4">List of Colleges</h2>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>College Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college, index) => (
              <CollegeRow
                key={`college-row-${index}`}
                college={college}
                index={index}
                onChange={handleChange}
              />
            ))}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default CollegeList;
