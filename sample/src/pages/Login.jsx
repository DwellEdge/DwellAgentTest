import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>

      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">

        {/* Name */}
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
        <div className="w-full max-w-4xl flex gap-6">

          {/* Login Card */}
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
            className="flex-1 rounded-3xl p-10 flex flex-col gap-6 shadow-lg hover:shadow-xl transition cursor-pointer group"
            onClick={() => navigate('/login')}>
            <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md">🔑</div>
            <div>
              <h2 style={{ color: '#7c2d12' }} className="text-2xl font-extrabold">Login</h2>
              <p style={{ color: '#a8674a' }} className="mt-2 text-sm leading-relaxed">
                Already have an account? Sign in to browse properties, connect with agents, and manage your listings.
              </p>
            </div>
            <button style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition mt-auto">
              Login →
            </button>
          </div>

          <div className="flex items-center">
            <span style={{ color: '#d4a090' }} className="text-lg font-bold">OR</span>
          </div>

          {/* Create Account Card */}
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
            className="flex-1 rounded-3xl p-10 flex flex-col gap-6 shadow-lg hover:shadow-xl transition cursor-pointer"
            onClick={() => navigate('/create-account')}>
            <div style={{ background: 'linear-gradient(135deg, #f59e6c, #fbbf9a)' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md">📝</div>
            <div>
              <h2 style={{ color: '#7c2d12' }} className="text-2xl font-extrabold">Create Account</h2>
              <p style={{ color: '#a8674a' }} className="mt-2 text-sm leading-relaxed">
                New here? Create your account to explore thousands of properties and find your dream home.
              </p>
            </div>
            <button style={{ borderColor: '#e8724a', color: '#c2511f' }}
              className="w-full border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition mt-auto">
              Create Account →
            </button>
          </div>

        </div>
      </div>

      <p style={{ color: '#d4a090' }} className="text-sm text-center pb-6">© 2026 DwellAgent</p>
    </div>
  )
}

export default Login