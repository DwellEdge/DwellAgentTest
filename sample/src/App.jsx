import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Payment from "./pages/Payment";
import PhoneForm from "./pages/PhoneForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/home" element={<Home />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/phoneform" element={<PhoneForm />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;