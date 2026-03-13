import { Link } from 'react-router-dom'

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#0ea5e940,transparent_35%),radial-gradient(circle_at_80%_20%,#22c55e35,transparent_35%),linear-gradient(180deg,#020617_0%,#020617_35%,#0f172a_100%)]" />
      </div>

      <header className="border-b border-slate-800/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="group">
            <p className="text-sm tracking-[0.25em] text-cyan-300/90 uppercase">Zeus OPK</p>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">Automation Platform</p>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className="px-3 py-2 text-sm rounded-md border border-slate-700 bg-slate-900/60 hover:bg-slate-800 transition-colors"
            >
              Landing
            </Link>
            <Link
              to="/docs"
              className="px-3 py-2 text-sm rounded-md border border-slate-700 bg-slate-900/60 hover:bg-slate-800 transition-colors"
            >
              Documentation
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}

export default PublicLayout
