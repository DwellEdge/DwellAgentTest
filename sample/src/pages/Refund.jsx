import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

export default function Refund() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-extrabold text-[#7c2d12] mb-4">Refund & Cancellation</h1>
        <p className="text-sm text-slate-700">Refunds and cancellations are handled per service and offer. For payments processed via Razorpay, refund requests are subject to payment gateway policies and verification.</p>
      </main>

      <Footer />
    </div>
  )
}
