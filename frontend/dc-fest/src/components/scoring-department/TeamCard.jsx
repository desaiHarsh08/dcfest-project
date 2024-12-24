/* eslint-disable react/prop-types */

import { FaEdit, FaHashtag, FaListOl, FaSave, FaStar, FaTrophy } from "react-icons/fa";
import { Button, Modal, Form } from "react-bootstrap";
import { useState } from "react";

/* eslint-disable no-unused-vars */
const TeamCard = ({ index, team, teams, setTeams, onTeamChange }) => {
  const [showModal, setShowModal] = useState(false);

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <tr key={index}>
        <td>
          {/* {team?.slot ? `${team?.slot}` : "-"} */}
          <input type="number" className="text-center" value={team.slot} name="slot" onChange={(e) => onTeamChange(e, index)} />
        </td>
        <td>{team?.teamNumber || "If you see this message, then please do save the attendance again!"}</td>
        <td>{team?.points || "-"}</td>
        <td>{team?.rank || "-"}</td>
        {/* <td>
          <Button variant="danger" disabled={team?.teamNumber == null} type="button" size="sm" onClick={handleEditClick}>
            <FaEdit className="fs-3" />
          </Button>
        </td> */}
      </tr>

      {/* <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Team Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="w-100">
            <Form.Group controlId="formSlot">
              <Form.Label>
                <FaHashtag /> Slot
              </Form.Label>
              <Form.Control type="text" value={team.slot} name="slot" onChange={(e) => onTeamChange(e, index)} />
            </Form.Group>
            <Form.Group controlId="formTeamNumber">
              <Form.Label>
                <FaListOl /> Team Number
              </Form.Label>
              <Form.Control type="text" value={team.teamNumber} readOnly style={{ background: "aliceblue" }} />
            </Form.Group>
            <Form.Group controlId="formPoints">
              <Form.Label>
                <FaStar /> Points
              </Form.Label>
              <Form.Control type="text" value={team.points} readOnly style={{ background: "aliceblue" }} />
            </Form.Group>
            <Form.Group controlId="formRank">
              <Form.Label>
                <FaTrophy /> Rank
              </Form.Label>
              <Form.Control type="text" value={team.rank} readOnly style={{ background: "aliceblue" }} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            <FaSave /> Save
          </Button>
        </Modal.Footer>
      </Modal> */}
    </>
  );
};

export default TeamCard;
