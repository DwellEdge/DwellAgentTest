import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Welcome from './pages/Welcome'
import Payment from "./pages/Payment";
import PhoneForm from './pages/PhoneForm'
import Agents from './pages/Agents'
import AgentRegister from './pages/AgentRegister'

function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Welcome />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/phoneform" element={<PhoneForm />} />
      <Route path="/agent" element={<Agents />} />
      <Route path="/agent-register" element={<AgentRegister />} />
    </Routes>
  )
}

export default App