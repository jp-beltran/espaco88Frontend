import { createBrowserRouter } from "react-router-dom";
import AuthPage from "../Pages/AuthPage";
import UserPage from "../Pages/UserPage";

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
]);

export default router;
