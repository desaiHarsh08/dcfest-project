/* eslint-disable react/prop-types */
import UserForm from "./UserForm";
import "../../styles/UserRow.css"; // Assuming custom styles are here
import { updateUser } from "../../services/user-api";

const UserRow = ({ index, user, users, setUsers, onChange }) => {
  const handleSaveEdit = async () => {
    if (user.password == null || user.password == "" || user.name == "" || user.password == "" || user.email == "") {
      alert("Please provide the valid details!");
    } else {
      try {
        const response = await updateUser(user);
        const newUsers = [...users];
        newUsers[index] = response;
        setUsers(newUsers);
        alert(`${user.name} updated successfully!`);
      } catch (error) {
        alert("Unable to edit the details of the user");
        console.log(error);
      }
    }
  };

  const getBadgeColor = (userType) => {
    switch (userType) {
      case "ADMIN":
        return "badge-admin";
      case "REGISTRATION_DESK":
        return "badge-registration";
      case "ATTENDANCE_DESK":
        return "badge-attendance";
      case "REPORT_DESK":
        return "badge-report";
      case "SCORE_SHEET_DESK":
        return "badge-score-sheet";
      case "SCORE_ENTRY_DESK":
        return "badge-score-entry";
      default:
        return "badge-default";
    }
  };

  return (
    <tr className="user-row">
      <td>{index + 1}</td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td className="text-center">
        <span className={`badge rounded-pill ${getBadgeColor(user.type)}`}>{user.type}</span>
      </td>
      <td>
        <UserForm formType="EDIT" user={user} onUserChange={onChange} index={index} onSave={handleSaveEdit} />
      </td>
    </tr>
  );
};

export default UserRow;
