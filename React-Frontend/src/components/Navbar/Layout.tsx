import { Outlet } from 'react-router';
import Navbar from './Navbar';

// Wraps every logged-in page: navbar on top, the current page below.
// <Outlet /> is where React Router renders the matched child route.
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default Layout;
