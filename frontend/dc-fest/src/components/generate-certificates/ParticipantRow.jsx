/* eslint-disable react/prop-types */
import { Button } from "react-bootstrap";

export default function ParticipantRow({ srno, participant, onGenerateCertificate, category, availableEvent, selectedCollege }) {
  return (
    <tr>
      <td>{srno}</td>
      <td>{selectedCollege?.icCode}</td>
      <td>{participant?.group}</td>
      <td>{participant?.name}</td>
      <td>
        <div className="d-flex align-items-center gap-4 w-100">
          <div className="w-25 d-flex justify-content-end">
            <img src={`/${category?.slug}.jpg`} alt={""} style={{ height: "52px", width: "52px", objectFit: "contain" }} />
          </div>
          <p className="w-75 d-flex">{category?.name}</p>
        </div>
      </td>
      <td>
        <div className="d-flex align-items-center gap-4 w-100">
          <div className="w-25 d-flex justify-content-end">
            <img src={`/${availableEvent?.slug}.jpg`} alt={""} style={{ height: "52px", width: "52px", objectFit: "contain" }} />
          </div>
          <p className="w-75 d-flex">{availableEvent?.title}</p>
        </div>
      </td>
      <td>
        <Button
          variant="danger"
          onClick={() =>
            onGenerateCertificate({
              name: participant?.name,
              collegeName: selectedCollege?.name,
              eventName: availableEvent?.title,
            })
          }
        >
          Generate
        </Button>
      </td>
    </tr>
  );
}
