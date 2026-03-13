import { Link } from 'react-router-dom'
import { BookOpen, ShieldCheck, Bot, ServerCog, Wrench, Rocket } from 'lucide-react'

const featureCards = [
  {
    icon: Bot,
    title: 'Collector Workflow',
    description: 'Configure delivery bots and collector accounts with trade control, allowed-name list, vending, and Kafra fallback.'
  },
  {
    icon: ServerCog,
    title: 'Support and Party Setup',
    description: 'Build support accounts with follow behavior, party automation, and detailed skill condition rules.'
  },
  {
    icon: ShieldCheck,
    title: 'Security on Login',
    description: 'Standardize @security handling with PIN-based startup flow for all account types.'
  },
  {
    icon: Wrench,
    title: 'Operations Guide',
    description: 'Troubleshooting steps for deal flow issues, performance problems, and deployment consistency.'
  }
]

const LandingPage = () => {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80 p-8 md:p-10">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="inline-block text-xs uppercase tracking-[0.25em] text-cyan-300 mb-3">Public Portal</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Zeus OPK
              <span className="block text-cyan-300">Landing and Documentation</span>
            </h1>
            <p className="mt-4 text-slate-300 leading-relaxed">
              This public page is the single source for setup tutorials, feature walkthroughs, and troubleshooting for Zeus OPK users.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Open Documentation
              </Link>
              <a
                href="https://zeus-opk.vercel.app/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 bg-slate-900/50 hover:bg-slate-800 transition-colors"
              >
                <Rocket className="w-4 h-4" />
                Public URL
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white mb-3">What is public now</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Landing page at `/`</li>
              <li>Documentation at `/docs`</li>
              <li>Admin login is moved under `/admin/login`</li>
              <li>Admin dashboard/tools remain protected behind authentication</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureCards.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
            <div className="inline-flex p-2 rounded-lg bg-cyan-500/15 text-cyan-300 mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default LandingPage
