import './App.css'
import { Routes, Route } from "react-router-dom";
import Login from './Pages/LoginPage';
import ClientRegisterPage from './Pages/ClientRegisterPage';
import CaregiverRegisterPage from './Pages/CaregiverRegisterPage';

function App() {

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/clientregister" element={<ClientRegisterPage />} />
        <Route path="/caregiverregister" element={<CaregiverRegisterPage />} />
      </Routes>
    </>
  )
}

export default App
