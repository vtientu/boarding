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
import UserDashboard from "./pages/tenant/UserDashboard";
import UserProfile from "./components/UserProfile";
import Payment from "./pages/tenant/Payment";

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
				path: "rooms",
				element: <RoomManagement />,
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
				path: "payment",
				element: <Payment />,
			},
			{
				path: "logout",
				element: <Logout />,
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
