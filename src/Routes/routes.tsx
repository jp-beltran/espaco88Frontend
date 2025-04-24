import { createBrowserRouter } from "react-router-dom";
import AuthPage from "../Pages/AuthPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthPage />,
  },

  {
    path: "/register",
    element: <AuthPage />,
  },
]);

export default router;
