import { useContext, useEffect, useState, useCallback } from "react";
import { Container, Nav, Tab } from "react-bootstrap";
import { createUser, fetchUsers } from "../services/auth-apis";
import { fetchAllAcademicYears, updateAcademicYear } from "../services/academic-year-apis";
import UserForm from "../components/settings/UserForm";
import UserList from "../components/settings/UserList";
import RegistrationDeadlinesList from "../components/settings/RegistrationDeadlinesList";
import AcademicYearEditModal from "../components/settings/AcademicYearEditModal";
import { useDispatch } from "react-redux";
import { toggleLoading } from "../app/slices/toggleLoadingSlice";
import { toggleRefetch } from "../app/slices/toggleRefetchSlice";
import { AuthContext } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !accessToken) {
      // Wait for authentication to be ready
      return;
    }
    if (user?.type != "ADMIN") {
      navigate(-1);
    }
  }, [user, accessToken, navigate]);

  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsappNumber: "",
    type: "ADMIN",
    disabled: false,
  });

  const getUsers = useCallback(async () => {
    try {
      const response = await fetchUsers(1);
      if (response && response.content) {
        const newUsers = response.content.map((user) => {
          user.password = null;
          return user;
        });
        setUsers(newUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // Show user-friendly error message
      if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
        navigate("/login");
      } else {
        alert("Failed to load users. Please try again later.");
      }
    }
  }, [navigate]);

  const getAcademicYears = useCallback(async () => {
    try {
      const response = await fetchAllAcademicYears();
      setAcademicYears(response || []);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      if (error.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
        navigate("/login");
      } else {
        alert("Failed to load academic years. Please try again later.");
      }
    }
  }, [navigate]);

  useEffect(() => {
    // Only fetch data if user is authenticated, has access token, and is ADMIN
    // Add a small delay to ensure interceptors are set up
    if (user?.type === "ADMIN" && accessToken) {
      // Small delay to ensure interceptors are ready
      const timer = setTimeout(() => {
        getUsers();
        getAcademicYears();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, accessToken, getUsers, getAcademicYears]);

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

  const handleEditAcademicYear = (academicYear) => {
    setSelectedAcademicYear(academicYear);
    setShowEditModal(true);
  };

  const handleSaveAcademicYear = async (updatedData) => {
    try {
      dispatch(toggleLoading());
      await updateAcademicYear(updatedData.id, updatedData);
      alert("Academic year updated successfully!");
      setShowEditModal(false);
      setSelectedAcademicYear(null);
      getAcademicYears();
    } catch (error) {
      console.error("Error updating academic year:", error);
      alert(error.response?.data?.message || "Failed to update academic year. Please try again.");
    } finally {
      dispatch(toggleLoading());
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Settings</h1>
      <Tab.Container defaultActiveKey="users">
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link eventKey="users">Users</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="deadlines">Registration Deadlines</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="users">
            <UserForm formType="ADD" user={newUser} onUserChange={handleUserChange} onSave={handleSaveNewUser} />
            <UserList setUsers={setUsers} users={users} />
          </Tab.Pane>

          <Tab.Pane eventKey="deadlines">
            <RegistrationDeadlinesList academicYears={academicYears} onEdit={handleEditAcademicYear} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      <AcademicYearEditModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedAcademicYear(null);
        }}
        academicYear={selectedAcademicYear}
        onSave={handleSaveAcademicYear}
      />
    </Container>
  );
};

export default Settings;
