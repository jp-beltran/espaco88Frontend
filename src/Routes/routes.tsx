import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../Pages/RegisterPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RegisterPage />,
  },

  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

export default router;
