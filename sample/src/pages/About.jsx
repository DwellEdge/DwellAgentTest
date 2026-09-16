import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-extrabold text-[#7c2d12] mb-4">About Us</h1>
        <p className="text-sm text-slate-700">DwellAgent connects property seekers with verified agents across cities. We aim to simplify property discovery and agent matching.</p>
      </main>

      <Footer />
    </div>
  )
}
