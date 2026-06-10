import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function OTPVerify() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const handleVerify = () => {
    if (otp.length !== 4) { setError('Please enter a 4-digit OTP'); return }
    if (otp === '1234') { navigate('/home') }
    else { setError('Incorrect OTP. Please try again.') }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>

      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">

        {/* name */}
        <div style={{ color: '#c2511f' }} className="text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate('/')}>DWELLAGENT</div>

        {/* Back  */}
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
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg">🔐</div>
            <h1 style={{ color: '#7c2d12' }} className="text-4xl font-extrabold leading-tight">
              One Step<br />Away
            </h1>
            <p style={{ color: '#a8674a' }} className="text-base leading-relaxed">
              Enter the OTP sent to your mobile to verify your identity securely.
            </p>
            <div style={{ background: '#fff8f5', border: '1px solid #fdd9c8' }} className="rounded-2xl p-5">
              <p style={{ color: '#c2511f' }} className="text-sm font-medium">
                🔒 OTP-based verification keeps your account safe and secure.
              </p>
            </div>
          </div>

          {/* Right */}
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
            className="flex-1 rounded-3xl p-10 flex flex-col gap-6 items-center shadow-lg">
            <div className="text-center">
              <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">🔐</div>
              <h2 style={{ color: '#7c2d12' }} className="text-2xl font-extrabold">Verify OTP</h2>
              <p style={{ color: '#a8674a' }} className="mt-1 text-sm">Enter the 4-digit code sent to your mobile</p>
            </div>

            <div style={{ background: '#fdd9c8' }} className="w-full h-px" />

            <input type="text" placeholder="_ _ _ _" value={otp}
              onChange={(e) => { setOtp(e.target.value); setError('') }}
              maxLength={4}
              style={{ borderColor: error ? '#f87171' : '#fdd9c8', color: '#e8724a', background: '#fff8f5' }}
              className="border-2 rounded-xl px-6 py-4 text-3xl text-center tracking-widest w-48 focus:outline-none font-bold placeholder-orange-200" />

            {error && <p style={{ color: '#ef4444' }} className="text-sm -mt-3">{error}</p>}

            <button onClick={handleVerify}
              style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">
              Verify & Continue →
            </button>

            <p style={{ color: '#d4a090' }} className="text-xs">
              Didn't receive OTP?{' '}
              <span style={{ color: '#e8724a' }} className="cursor-pointer font-semibold">Resend</span>
            </p>
          </div>
        </div>
      </div>

      <p style={{ color: '#d4a090' }} className="text-sm text-center pb-6">© 2026 DwellAgent</p>
    </div>
  )
}

export default OTPVerify