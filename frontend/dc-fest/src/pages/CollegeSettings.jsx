import {
  Button,
  Card,
  Container,
  Table,
  Tooltip,
  OverlayTrigger,
  Badge,
} from "react-bootstrap";
import Navbar from "../components/Navbar/Navbar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCollegeByIcCode } from "../services/college-apis";
import { FaEdit, FaUserTie } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function CollegeSettings() {
  const { iccode } = useParams();
  const [college, setCollege] = useState();

  useEffect(() => {
    getCollege();
  }, [iccode]);

  const getCollege = async () => {
    try {
      const response = await fetchCollegeByIcCode(iccode);
      console.log("college:", response);
      setCollege(response);
    } catch (error) {
      console.log(error);
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {props}
    </Tooltip>
  );

  return (
    <div>
      <Navbar />
      <Container>
        <h1 className="my-4 text-center text-primary">{college?.name}</h1>
        <Card className="mb-5 shadow-sm border-primary">
          <Card.Body>
            <Card.Title className="text-primary mb-4">Basic Details</Card.Title>
            <ul className="list-unstyled">
              <li className="d-flex">
                <p style={{ minWidth: "100px" }}>
                  <strong>Email:</strong>
                </p>
                <p style={{ minWidth: "100px" }}>
                  <span>{college?.email || "N/A"}</span>
                </p>
              </li>
              <li className="d-flex">
                <p style={{ minWidth: "100px" }}>
                  <strong>Phone:</strong>
                </p>
                <p>
                  <span>{college?.phone || "N/A"}</span>
                </p>
              </li>
              <li className="d-flex">
                <p style={{ minWidth: "100px" }}>
                  <strong>ICCODE:</strong>
                </p>
                <p>
                  <span>{college?.icCode || "N/A"}</span>
                </p>
              </li>
            </ul>
            <Button variant="success" className="m-0">
              Edit
            </Button>
          </Card.Body>
        </Card>

        <h2 className="mb-4 text-secondary">Representatives</h2>
        <Table bordered hover responsive className="table-striped shadow-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th>Sr No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {college?.representatives?.length > 0 ? (
              college.representatives.map((rep, repIndex) => (
                <tr key={`rep-${rep.id}`} className="align-middle">
                  <td>{repIndex + 1}</td>
                  <td>{rep.name}</td>
                  <td>{rep.email}</td>
                  <td>{rep.phone}</td>
                  <td>
                    <Badge variant={"info"}>Representative</Badge>
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip("Edit Representative")}
                    >
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No representatives available.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
    </div>
  );
}
