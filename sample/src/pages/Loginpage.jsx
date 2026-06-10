import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    setError('')
    if (!mobile) { setError('Please enter your mobile number'); return }
    if (mobile.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
    const stored = sessionStorage.getItem('userData')
    if (!stored) { setError('No account found. Please create an account first.'); return }
    const userData = JSON.parse(stored)
    if (userData.mobile === mobile) { navigate('/home') }
    else { setError('Mobile number not found. Please create an account.') }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>

      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">

        {/* name */}
        <div style={{ color: '#c2511f' }} className="text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate('/')}>DWELLAGENT</div>

        {/* Back */}
        <button onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #fdd9c8', color: '#c2511f' }}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-bold hover:shadow-lg transition">
          ← Back
        </button>

      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl flex gap-12 items-center">

          {/* Left */}
          <div className="flex-1 hidden md:flex flex-col gap-6">
            <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🔑</div>
            <h1 style={{ color: '#7c2d12' }} className="text-4xl font-extrabold leading-tight">
              Welcome<br />Back
            </h1>
            <p style={{ color: '#a8674a' }} className="text-base leading-relaxed">
              Sign in to access your saved properties and continue your real estate journey.
            </p>
            {[
              { icon: '📞', text: 'Contact agents directly' },
              { icon: '📊', text: 'Track your enquiries' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #fdd9c8' }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-orange-900">
                <span>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>

          {/* Right - Form */}
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
            className="flex-1 rounded-3xl p-10 flex flex-col gap-5 shadow-lg">
            <div>
              <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-3">🔑</div>
              <h2 style={{ color: '#7c2d12' }} className="text-2xl font-extrabold">Login</h2>
              <p style={{ color: '#a8674a' }} className="mt-1 text-sm">Enter your registered mobile number</p>
            </div>

            <div style={{ background: '#fdd9c8' }} className="w-full h-px" />

            <input placeholder="Mobile Number (10 digits)" value={mobile}
              onChange={(e) => { setError(''); setMobile(e.target.value.replace(/\D/g, '')) }}
              maxLength={10} inputMode="numeric"
              style={{ borderColor: error ? '#f87171' : '#fdd9c8', color: '#7c2d12' }}
              className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 w-full placeholder-orange-300" />

            {error && <p style={{ color: '#ef4444' }} className="text-sm -mt-2">{error}</p>}

            <button onClick={handleLogin}
              style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">
              Login →
            </button>

            <p style={{ color: '#d4a090' }} className="text-xs text-center">
              Don't have an account?{' '}
              <span style={{ color: '#e8724a' }} className="cursor-pointer font-semibold"
                onClick={() => navigate('/create-account')}>Create one here</span>
            </p>
          </div>
        </div>
      </div>

      <p style={{ color: '#d4a090' }} className="text-sm text-center pb-6">© 2026 DwellAgent</p>
    </div>
  )
}

export default LoginPage