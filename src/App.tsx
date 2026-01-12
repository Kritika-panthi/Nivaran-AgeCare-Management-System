import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/Aboutus";
import Services from "./Pages/Service";
import Contact from "./Pages/ContactUs";
import LoginPage from "./Pages/LoginPage";
import ClientRegisterPage from "./Pages/ClientRegisterPage";
import CaregiverRegisterPage from "./Pages/CaregiverRegisterPage";


import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ScrollToTop from "./Components/ScrollToTop";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          }
        />

        <Route
          path="/about"
          element={
            <>
              <Header />
              <About />
              <Footer />
            </>
          }
        />

        <Route
          path="/services"
          element={
            <>
              <Header />
              <Services />
              <Footer />
            </>
          }
        />

        <Route
          path="/contact"
          element={
            <>
              <Header />
              <Contact />
              <Footer />
            </>
          }
        />

         {/* Authentication Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/client" element={<ClientRegisterPage />} />
        <Route path="/register/caregiver" element={<CaregiverRegisterPage />} />


      </Routes>
    </AuthProvider>
  );
}

export default App;
