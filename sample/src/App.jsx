import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Createaccount from './pages/Createaccount'
import OTPVerify from './pages/OTPVerify'
import Welcome from './pages/Welcome'
import Loginpage from './pages/Loginpage'
import Payment from "./pages/Payment";

function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/signup-choice" element={<Login />} />
      <Route path="/create-account" element={<Createaccount />} />
      <Route path="/verify-otp" element={<OTPVerify />} />
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Loginpage/>}/>
      <Route path="/payment" element={<Payment />} />
    </Routes>
  )
}

export default App