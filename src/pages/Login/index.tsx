import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("isLoggedIn", "true")
    navigate("/overview")
  }

  return (
    <div className="min-h-screen bg-[#141518] text-white grid place-items-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#17181B] shadow-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-widest">Login</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              type="text"
              className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 py-2 font-semibold tracking-wide transition-colors"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-xs text-white/40 text-center">
          Linux CMD secure access • Frotect v1.0
        </p>
      </div>
    </div>
  )
}
