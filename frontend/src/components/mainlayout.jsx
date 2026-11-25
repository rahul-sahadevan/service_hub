import Navbar from "../components/navbar/navbar";


const MainLayout = ({ children }) => {
  const handleLogout = async () => {
    // Call your backend logout API.
    // Clear authentication state after successful logout.
  };

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <main className="main-content">
        {children}
      </main>
    </>
  );
}

export default MainLayout;