import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Welcome from './pages/Welcome'
import Payment from "./pages/Payment";
import PhoneForm from './pages/PhoneForm'
import Agents from './pages/Agents'
import AgentRegister from './pages/AgentRegister'
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import About from './pages/About'
import Refund from './pages/Refund'
import Shipping from './pages/Shipping'
import Contact from './pages/Contact'

function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Welcome />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/refund" element={<Refund />} />
      <Route path="/shipping" element={<Shipping />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/phoneform" element={<PhoneForm />} />
      <Route path="/agent" element={<Agents />} />
      <Route path="/agent-register" element={<AgentRegister />} />
      <Route path="/agent-login" element={<AgentLogin />} />
      <Route path="/agent-dashboard" element={<AgentDashboard />} />
    </Routes>
  )
}

export default App