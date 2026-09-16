import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-[#7c2d12] mb-4">Terms of Service</h1>
        <p className="text-sm text-slate-700 mb-4">Last Updated: September 2026</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">The Gist</h2>
          <p className="mt-2 text-sm text-slate-700">These Terms describe your rights and responsibilities when using DwellAgent services. By using DwellAgent you agree to these terms. This page also contains key statements required for Razorpay registration for DwellAgent merchant onboarding.</p>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold">Payment and Razorpay</h3>
          <p className="mt-2 text-sm text-slate-700">DwellAgent may use Razorpay for payment processing. Merchants and agents registering for payment collection must provide accurate business and contact information. The policies here are intended to support Razorpay compliance checks.</p>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold">User Responsibilities</h3>
          <p className="mt-2 text-sm text-slate-700">Users must provide truthful information, not misuse the service, and follow applicable laws. For agent onboarding, follow agent verification and KYC requirements as requested.</p>
        </section>

        <section className="mb-6">
          <h3 className="font-semibold">Contact</h3>
          <p className="mt-2 text-sm text-slate-700">For questions about these terms or Razorpay onboarding, contact support@dwellagent.example or use the Contact page.</p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
