import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  Dashboard,
  HomeLayout,
  Landing,
  Login,
  Logout,
  Register,
} from "./pages";
import { ToastContainer } from "react-toastify";
import RoomManagement from "./pages/admin/RoomManagement";
import BillManagement from "./pages/admin/BillManagement";
import TenantManagement from "./pages/admin/TenantManagement";
import BoardingHouseManagement from "./pages/admin/BoardingHouseManagement";
import UserDashboard from "./pages/tenant/UserDashboard";
import UserProfile from "./components/UserProfile";
import RoomDetail from "./pages/admin/RoomDetail";
import BoardingHouseDetail from "./pages/admin/BoardingHouseDetail";import Chat from "./pages/client/Chat";
import ChatDetails from "./pages/client/ChatDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "user-dashboard",
        element: <UserDashboard />,
      },
      {
        path: "profile",
        element: <UserProfile />,
      },
      {
        path: "boarding-houses",
        element: <BoardingHouseManagement />,
      },
			{
				path: "boardinghouses/:id",
				element: <BoardingHouseDetail />,
			},
      {
        path: "rooms",
        element: <RoomManagement />,
      },
			{
				path: "rooms/:id",
				element: <RoomDetail />,
			},
      {
        path: "bills",
        element: <BillManagement />,
      },
      {
        path: "tenants",
        element: <TenantManagement />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path: "chat/:id",
        element: <ChatDetails />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-center" />
    </>
  );
}

export default App;
