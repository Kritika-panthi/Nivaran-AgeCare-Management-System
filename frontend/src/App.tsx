import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/Aboutus";
import Services from "./Pages/Service";
import Contact from "./Pages/ContactUs";
import DashboardLayout from "./Pages/DashboardLayout";

import LoginPage from "./Pages/LoginPage";
import ClientRegisterPage from "./Pages/ClientRegisterPage";
import CaregiverRegisterPage from "./Pages/CaregiverRegisterPage";
import CompleteProfilePage from "./Pages/CompleteProfilePage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ResetPasswordPage from "./Pages/ResetPasswordPage";
import PaymentSuccessPage from "./Pages/PaymentSuccessPage";
import PaymentFailurePage from "./Pages/PaymentFailurePage";
import ClientDashboard from "./Pages/ClientDashboard";

import AdminDashboard from "./Pages/AdminDashboard";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ScrollToTop from "./Components/ScrollToTop";
import ProtectedRoute from "./Components/RoleProtectedRoute";

import { AuthProvider } from "./context/AuthContext";
import ClientProfilePage from "./Pages/ClientProfilePage";
import FindCaregiverPage from "./Pages/FindCaregiverPage";
import FamilyFormPage from "./Pages/FamilyForm";
import CaregiverDashboard from "./Pages/CaregiverDashboard";
import CaregiverAvailabilityPage from "./Pages/CaregiverAvailability";
import CaregiverProfilePage from "./Pages/CaregiverProfilePage";
import BookingPage from "./Pages/BookingPage";
import TrackCaregiverPage from "./Pages/TrackCaregiverPage";

function App() {
  return (
    <AuthProvider>
      {/* Scroll to top on route change */}
      <ScrollToTop />

      <Routes>

        {/* Public Pages With Layout */}
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failure" element={<PaymentFailurePage />} />

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="profile" element={<ClientProfilePage />} />
            <Route path="findcaregiver" element={<FindCaregiverPage />} />
            <Route path="familyform" element={<FamilyFormPage />} />
            <Route path="family/edit/:id" element={<FamilyFormPage />} />
            <Route path="book/:caregiverId" element={<BookingPage />} />
            <Route path="trackcaregiver" element={<TrackCaregiverPage />} />
            <Route path="complete-profile" element={<CompleteProfilePage />} />
          </Route>

        <Route
          path="/caregiver"
          element={
            <ProtectedRoute allowedRoles={["caregiver"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CaregiverDashboard/>} />
          
          {/* Availability management page */}
          <Route path="availability" element={<CaregiverAvailabilityPage />} />
          <Route path="profile" element={<CaregiverProfilePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
