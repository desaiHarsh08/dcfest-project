/* eslint-disable react/prop-types */
import { Form } from "react-bootstrap";

export default function SelectCollege({ colleges, selectedCollege, setSelectedCollege }) {
  return (
    <Form.Group className="d-flex gap-2 align-items-center">
      <Form.Select
        value={selectedCollege?.id}
        onChange={(e) => {
          const college = colleges?.find((c) => c.id == e.target.value);
          setSelectedCollege(college);
        }}
      >
        {colleges?.map((college, collegeIndex) => (
          <option key={`college-${collegeIndex}`} value={college?.id}>
            {college?.name}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}
