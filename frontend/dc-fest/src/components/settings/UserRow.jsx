import { Badge } from "react-bootstrap";
import UserForm from "./UserForm";
import "../../styles/UserRow.css"
const UserRow = ({ index, user, onChange }) => {
  const handleSaveEdit = () => {};

  return (
    <tr>
      <td>{index + 1}</td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <Badge
          pill
          bg={
            user.type === "admin"
              ? "primary"
              : user.type === "college desk"
              ? "info"
              : "success"
          }
        >
          {user.type}
        </Badge>
      </td>
      <td>
        <UserForm
          formType="EDIT"
          user={user}
          onUserChange={onChange}
          index={index}
          onSave={handleSaveEdit}
        />
      </td>
    </tr>
  );
};

export default UserRow;
