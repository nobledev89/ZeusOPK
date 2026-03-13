import { Link } from 'react-router-dom'
import {
  BookOpen,
  Bot,
  ShieldCheck,
  ShoppingBag,
  Users,
  CheckCircle2,
  Rocket,
  ArrowRight
} from 'lucide-react'

const valueCards = [
  {
    icon: ShieldCheck,
    title: 'AI Auto-Response for Safer Chat Patterns',
    description:
      'ZeusOPK keeps replies varied and human-like, helping you avoid repetitive chat behavior that often gets flagged as bot activity.'
  },
  {
    icon: ShoppingBag,
    title: 'Collector Flow That Keeps Vending Running',
    description:
      'Delivery bots hand off loot to collector accounts, then your collector can continue vending with controlled deal and storage behavior.'
  },
  {
    icon: Users,
    title: 'Support Characters Built for Master Accounts',
    description:
      'Configure support roles with follow logic, support/self skill rules, and auto party invite handling for master-led runs.'
  },
  {
    icon: Bot,
    title: 'Scale Fast with Ready-to-Run Account Roles',
    description:
      'Start with clean role presets, apply security-on-login, and deploy farming, collector, and support setups with less manual tuning.'
  }
]

const outcomes = [
  'Faster onboarding from first account to full workflow',
  'Cleaner chat behavior with AI-assisted response controls',
  'Reliable collector + vending handoff during long sessions',
  'Role-based automation that turns setup time into earning time'
]

const LandingPage = () => {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80 p-8 md:p-10">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <p className="inline-block text-xs uppercase tracking-[0.25em] text-cyan-300 mb-3">ZeusOPK Sales Portal</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Sell More Time.
              <span className="block text-cyan-300">Automate Smarter with ZeusOPK.</span>
            </h1>
            <p className="mt-4 text-slate-300 leading-relaxed">
              ZeusOPK gives subscribers a high-conversion automation stack: AI auto response for less suspicious chat patterns,
              collector workflows for smooth vending, and support role automation with master-ready party control.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://zeus-opk.vercel.app/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
              >
                <Rocket className="w-4 h-4" />
                Buy ZeusOPK
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 bg-slate-900/50 hover:bg-slate-800 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                View Setup Tutorials
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Why subscribers convert</h2>
            <ul className="space-y-2 text-sm text-slate-300">
              {outcomes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {valueCards.map(({ icon: Icon, title, description }) => (
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
