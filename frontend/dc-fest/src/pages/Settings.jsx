import { useContext, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { createUser, fetchUsers } from "../services/auth-apis";
import UserForm from "../components/settings/UserForm";
import UserList from "../components/settings/UserList";
import { useDispatch } from "react-redux";
import { toggleLoading } from "../app/slices/toggleLoadingSlice";
import { toggleRefetch } from "../app/slices/toggleRefetchSlice";
import { AuthContext } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.type != "ADMIN") {
      navigate(-1);
    }
  }, [user, navigate]);

  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsappNumber: "",
    type: "ADMIN",
    disabled: false,
  });

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const response = await fetchUsers(1);
      let newUsers = response.content;
      newUsers = newUsers.map((user) => {
        user.password = null;
        return user;
      });
      setUsers(newUsers);
      setUsers(response.content);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveNewUser = async () => {
    if (newUser.name == "" || newUser.password == "" || newUser.email == "") {
      alert("Please provide the valid details!");
      return;
    }
    if (users.some((user) => user.email == newUser.email)) {
      alert("This account already exist!");
      return;
    }
    dispatch(toggleLoading());
    try {
      const response = await createUser(newUser);
      console.log(response);
      alert("New user created!");
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    } finally {
      dispatch(toggleLoading());
      getUsers();
    }
    dispatch(toggleRefetch());
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container className="mt-5">
      <UserForm formType="ADD" user={newUser} onUserChange={handleUserChange} onSave={handleSaveNewUser} />
      <UserList setUsers={setUsers} users={users} />
    </Container>
  );
};

export default Settings;
