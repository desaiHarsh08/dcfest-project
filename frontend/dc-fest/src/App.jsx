import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import CollegeRepresentativePage from "./pages/CollegeRepresentativePage";
import TeamsParticipatedPage from "./pages/TeamsParticipatedPage";
import CollegeRankingPage from "./pages/CollegeRankingPage";
import TeamsRankingPage from "./pages/TeamsRankingPage";
import EventsPage from "./pages/EventsPage";
import CategoriesPage from "./pages/CategoriesPage";
import Root from "./pages/Root";
import Login from "./pages/Login";
import Home from "./pages/Home";
import HomeDesk from "./components/home/HomeDesk";

import "./index.css";
import EventDeskPage from "./pages/EventDeskPage";
import EventRegistrationPage from "./pages/EventRegistrationPage";
import EventAttendancePage from "./pages/EventAttendancePage";
import EventParticipationPage from "./pages/EventParticipationPage";
import HelpDesk from "./pages/HelpDesk";
import ScoringDepartment from "./pages/ScoringDepartment";
import CollegeDesk from "./pages/CollegeDesk";
import CollegeEvent from "./pages/CollegeEvent";
import Settings from "./pages/Settings";
import CollegeDeskLayout from "./components/layout/CollegeDeskLayout";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CollegeGreetings from "./pages/CollegeGreetings";
import EventPage from "./pages/Eventpage";
import RootEvent from "./pages/RootEvent";
import AddEventPage from "./pages/AddEventPage";
import { AuthProvider } from "./providers/AuthProvider";
import AddParticipantByCollege from "./pages/AddParticipantByCollege";
import CollegeSettings from "./pages/CollegeSettings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      { path: "", element: <Root /> },

      { path: "event/:eventSlug", element: <RootEvent /> },
    ],
  },
  {
    path: "/reset-password",
    element: (
      <AuthProvider>
        <ResetPasswordPage />
      </AuthProvider>
    ),
  },
  {
    path: "/college-greeting",
    element: <CollegeGreetings />,
  },
  {
    path: ":iccode",
    element: (
      <AuthProvider>
        <CollegeDeskLayout />
      </AuthProvider>
    ),
    children: [
      { path: "", element: <CollegeDesk /> },
      { path: "settings", element: <CollegeSettings /> },
      {
        path: ":eventId",
        element: <Outlet />,
        children: [
          { path: "", element: <CollegeEvent /> },
          { path: "add", element: <AddParticipantByCollege /> },
        ],
      },
      {
        path: "categories",
        element: <Outlet />,
        children: [
          {
            path: "",
            element: <CategoriesPage />,
          },
          {
            path: ":categorySlug",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <EventsPage />,
              },
              {
                path: ":eventSlug",
                element: <EventPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  {
    path: "/home",
    element: <Home />,
    children: [
      { path: "", element: <HomeDesk /> },
      { path: "settings", element: <Settings /> },
      { path: "add-event", element: <AddEventPage /> },
      {
        path: "categories",
        element: <Outlet />,
        children: [
          {
            path: "",
            element: <CategoriesPage />,
          },
          {
            path: ":categorySlug",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <EventsPage />,
              },
              {
                path: ":eventSlug",
                element: <EventPage />,
              },
            ],
          },
        ],
      },
      {
        path: "college-representative",
        element: <CollegeRepresentativePage />,
      },
      {
        path: "event-desk",
        element: <Outlet />,
        children: [
          {
            path: "",
            element: <EventDeskPage />,
          },
          {
            path: "registration",
            element: <EventRegistrationPage />,
          },
          {
            path: "attendance",
            element: <EventAttendancePage />,
          },
          {
            path: "participation",
            element: <EventParticipationPage />,
          },
        ],
      },
      {
        path: "college-teams-participated",
        element: <TeamsParticipatedPage />,
      },
      { path: "college-rankings", element: <CollegeRankingPage /> },
      { path: "teams-ranking", element: <TeamsRankingPage /> },
      { path: "help-desk", element: <HelpDesk /> },
      { path: "scoring-department", element: <ScoringDepartment /> },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;
