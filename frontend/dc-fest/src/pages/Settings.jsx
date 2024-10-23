import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { createUser, fetchUsers } from "../services/auth-apis";
import UserForm from "../components/settings/UserForm";
import Pagination from "../components/globals/Pagination";
import UserList from "../components/settings/UserList";
import { useDispatch } from "react-redux";
import { toggleLoading } from "../app/slices/toggleLoadingSlice";
import { toggleRefetch } from "../app/slices/toggleRefetchSlice";

const Settings = () => {
  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    type: "ADMIN",
  });
  const [pageData, setPageData] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 100,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchUsers(pageData.currentPage)
      .then((data) => {
        setUsers(data.content);
        setPageData({
          currentPage: data.pageNumber,
          totalPages: data.totalPages,
          pageSize: data.pageSize,
          totalUsers: data.totalRecords,
        });
      })
      .catch((err) => console.log(err));
  }, [pageData.currentPage]);

  const handleSaveNewUser = async () => {
    dispatch(toggleLoading());
    try {
      const response = await createUser(newUser);
      console.log(response);
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(toggleLoading());
    }
    dispatch(toggleRefetch());
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">Settings</h1>
      <UserForm
        formType="ADD"
        user={newUser}
        onUserChange={handleUserChange}
        onSave={handleSaveNewUser}
      />
      <UserList setUsers={setUsers} users={users} />
      <Pagination pageData={pageData} setPageData={setPageData} />
    </Container>
  );
};

export default Settings;
