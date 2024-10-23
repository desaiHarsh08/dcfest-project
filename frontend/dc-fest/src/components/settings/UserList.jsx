import { Card, Table } from "react-bootstrap";
import UserRow from "./UserRow";
import "../../styles/UserList.css"
const UserList = ({ users, setUsers }) => {
  const handleUserChange = (e, userIndex) => {
    const { name, value } = e.target;
    const newUsers = users.map((user, index) => {
      if (userIndex === index) {
        return { ...user, [name]: value };
      }
      return user;
    });

    setUsers(newUsers);
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">User List</Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>SR No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <UserRow
                key={`user-row-${index}`}
                user={user}
                index={index}
                onChange={handleUserChange}
              />
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default UserList;
