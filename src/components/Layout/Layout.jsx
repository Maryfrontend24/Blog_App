import { Outlet } from "react-router-dom";
import Header from "/src/components/header/Header.jsx";
import Footer from "/src/components/footer/Footer.jsx";

const Layout = () => {
  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
export { Layout };
