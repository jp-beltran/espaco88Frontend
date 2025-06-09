import { createBrowserRouter } from "react-router-dom";
import AuthPage from "../Pages/AuthPage";
import UserPage from "../Pages/UserPage";
import NewAppointmentPage from "../Pages/NewAppointmentPage";
import ServicesPage from "../Pages/ServicesPage";
import ScheduleSettingsPage from "../Pages/ScheduleSettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthPage />,
  },

  {
    path: "/register",
    element: <AuthPage />,
  },

  {
    path: "/user",
    element: <UserPage />,
  },
    { path: "/appointment/new",
    element: <NewAppointmentPage />,
  },
    {
    path: "/services",
    element: <ServicesPage />,
  },
  {
        path: "/schedule-settings",
    element: <ScheduleSettingsPage />,
  }
]);

export default router;
