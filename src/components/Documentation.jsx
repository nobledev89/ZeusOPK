import { useMemo, useState } from 'react'
import {
  BookOpen,
  Search,
  CheckCircle2,
  Users,
  Bot,
  ShoppingBag,
  Shield,
  MessageSquareMore,
  LifeBuoy
} from 'lucide-react'

const quickStart = {
  id: 'quick-start',
  title: 'Universal Quick Start',
  icon: BookOpen,
  summary: 'Use this once, then continue with the role tutorial that matches your account goal.',
  steps: [
    'Open ZeusOPK Manager and create a new account from template, or duplicate a stable working account.',
    'Set login credentials, character slot, lock map, and security PIN before starting the bot.',
    'Choose the role you are building: Farmer, Collector/Vendor, or Support/Master.',
    'Save your settings, start one account first, and confirm expected behavior in logs before scaling.'
  ],
  checks: [
    'Account launches without missing field errors.',
    'Security flow completes on startup.',
    'Role-specific behavior triggers correctly in the first test run.'
  ]
}

const roleGuides = [
  {
    id: 'farmer',
    label: 'Farmer',
    title: 'Farmer Path: Build a Stable Loot Runner',
    icon: Bot,
    summary: 'Best for users running combat accounts that farm and feed collector pipelines.',
    bestFor: 'Solo or multi-account farming with controlled chat behavior.',
    steps: [
      'Set account type to Combat/Farmer and confirm lock map, movement, and combat behavior.',
      'Configure pickup, auto-sell, and weight thresholds to prevent inventory stalls.',
      'Enable AI auto-response and tune reply cooldown so chat behavior looks less repetitive and less bot-like.',
      'Set collector delivery target if this farmer will hand off loot to a vending account.',
      'Run test session for at least 10 minutes and check for repeated loop errors.'
    ],
    checks: [
      'Combat loop runs without map-lock breaks.',
      'Auto-sell/storage is triggered only when needed.',
      'AI replies are enabled and not spamming.'
    ]
  },
  {
    id: 'collector-vendor',
    label: 'Collector/Vendor',
    title: 'Collector Path: Receive, Store, and Keep Vending Active',
    icon: ShoppingBag,
    summary: 'Best for users monetizing through continuous vending while receiving loot from delivery bots.',
    bestFor: 'Trade-controlled collector accounts that stay online as the vending anchor.',
    steps: [
      'Set account type to Collector and enable vending mode.',
      'Add allowed bot names so only approved delivery accounts can trigger trade handoff.',
      'Enable close-shop-when-trading, so collector can process deals then reopen vending smoothly.',
      'Configure collection map/coordinates and trade distance to match real movement paths.',
      'Set Kafra fallback and storage weight thresholds to avoid overweight deadlocks.'
    ],
    checks: [
      'Collector accepts deals only from approved names.',
      'Vending reopens correctly after trade cycles.',
      'Storage fallback works before cart/inventory reaches hard limit.'
    ]
  },
  {
    id: 'support-master',
    label: 'Support/Master',
    title: 'Support Path: Master-Led Party Automation',
    icon: Users,
    summary: 'Best for priest/buffer style accounts that follow a master and automate party upkeep.',
    bestFor: 'Support characters assisting one or more master farming accounts.',
    steps: [
      'Set account type to Support and turn on no-attack behavior.',
      'Set follow target to your master character and tune min/max follow distance.',
      'Enable auto party create/invite and auto-approve invites so masters are always grouped quickly.',
      'Configure support skills and self skills with sensible cooldowns and trigger conditions.',
      'Run a two-account test (master + support) and verify support reacts on every combat pull.'
    ],
    checks: [
      'Support stays in range of the master.',
      'Auto party invite flow works for every master listed.',
      'Skill triggers fire reliably without lockups or spam.'
    ]
  },
]

const docs = [
  {
    id: 'ai-chat-guard',
    title: 'AI Auto-Response and Chat Safety',
    icon: MessageSquareMore,
    summary: 'Use AI replies to keep conversations natural and reduce repetitive patterns that draw manual bot checks.',
    steps: [
      'Enable AI reply for accounts that interact with public chat.',
      'Keep reply cooldown active so responses look paced instead of instant.',
      'Use varied response prompts to avoid identical sentence repetition.',
      'Set maximum reply length so responses stay short and human-like.'
    ],
    checks: [
      'Replies trigger only on relevant messages.',
      'No rapid-fire responses in crowded maps.',
      'Conversation tone remains short and believable.'
    ]
  },
  {
    id: 'security',
    title: 'Security-on-Login Baseline',
    icon: Shield,
    summary: 'Protect every role with the same startup security discipline.',
    steps: [
      'Enable security command execution on every login.',
      'Set and verify the correct security PIN for each account.',
      'Restart the bot and confirm security completes before trade, chat, and vending actions.',
      'If security fails, correct the PIN first before tuning any other feature.'
    ],
    checks: [
      'PIN is saved and current.',
      'Startup security action appears in logs.',
      'No repeated security prompt loop.'
    ]
  },
  {
    id: 'faq',
    title: 'Subscriber FAQ',
    icon: LifeBuoy,
    summary: 'Fast answers for common subscriber-side setup and runtime issues.',
    faqs: [
      {
        q: 'Can I use one template for all account types?',
        a: 'Yes. Duplicate a stable template, then switch role-specific settings for Farmer, Collector, or Support before starting.'
      },
      {
        q: 'How do I keep collector vending while receiving loot?',
        a: 'Enable collector role, set allowed delivery names, and use close-for-trade + auto-reopen vending behavior.'
      },
      {
        q: 'How does auto party invite work for masters?',
        a: 'In Support role, enable party automation, set master names in party list, and keep auto-approve party invites enabled.'
      },
      {
        q: 'Why is AI auto-response important?',
        a: 'It helps avoid repetitive chat patterns by varying responses and timing, which lowers obvious bot-like behavior in public chat.'
      },
      {
        q: 'What should I do when behavior suddenly changes?',
        a: 'Run one account only, review current settings, and validate role-specific checks before scaling back to full multi-account mode.'
      }
    ]
  }
]

const normalized = (value) => (value || '').toLowerCase()

const mergeText = (items) => items.filter(Boolean).join(' ')

const roleMatchesQuery = (role, query) => {
  if (!query) return true

  return normalized(
    mergeText([
      role.label,
      role.title,
      role.summary,
      role.bestFor,
      ...(role.steps || []),
      ...(role.checks || [])
    ])
  ).includes(query)
}

const sectionMatchesQuery = (section, query) => {
  if (!query) return true

  const haystack = [
    section.title,
    section.summary,
    ...(section.steps || []),
    ...(section.checks || []),
    ...((section.faqs || []).flatMap(item => [item.q, item.a]))
  ].join(' ')

  return normalized(haystack).includes(query)
}

const Documentation = () => {
  const [queryInput, setQueryInput] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState(roleGuides[0].id)
  const query = normalized(queryInput.trim())

  const matchingRoles = useMemo(
    () => roleGuides.filter((role) => roleMatchesQuery(role, query)),
    [query]
  )

  const activeRole = useMemo(() => {
    return matchingRoles.find((role) => role.id === selectedRoleId) || matchingRoles[0] || null
  }, [matchingRoles, selectedRoleId])
  const ActiveRoleIcon = activeRole?.icon || Users

  const filteredDocs = useMemo(
    () => [quickStart, ...docs].filter(section => sectionMatchesQuery(section, query)),
    [query]
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Subscriber Setup Guide</h1>
        <p className="text-gray-400">
          Sales-ready onboarding docs for subscribers: role-based setup, daily operation, and troubleshooting.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary-600/20 text-primary-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">How to use this guide</h2>
            <p className="text-sm text-gray-400">
              Pick your role path, then follow the step-by-step sequence from top to bottom.
            </p>
          </div>
        </div>

        <label className="relative block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Search by role or feature (collector, support, AI, party)..."
            className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <p className="mt-3 text-xs text-gray-500">
          Showing {filteredDocs.length} tutorial sections and {matchingRoles.length} role paths.
        </p>
      </div>

      {matchingRoles.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-200 mb-3">Choose Your Role Path</h2>
          <div className="flex flex-wrap gap-2">
            {matchingRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  activeRole?.id === role.id
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                    : 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeRole && (
        <section
          id={activeRole.id}
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 scroll-mt-24 mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary-600/20 text-primary-300 shrink-0">
              <ActiveRoleIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{activeRole.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{activeRole.summary}</p>
              <p className="text-xs text-cyan-200 mt-2">{activeRole.bestFor}</p>
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-2">Step-by-Step</h3>
            <ol className="space-y-2 list-decimal list-inside text-sm text-gray-300">
              {activeRole.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-2">Validation Checklist</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {activeRole.checks.map((check) => (
                <li key={check} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {filteredDocs.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-200 mb-3">Quick Jump</h2>
          <div className="flex flex-wrap gap-2">
            {filteredDocs.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1.5 text-xs rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {filteredDocs.map((section) => {
          const Icon = section.icon || BookOpen
          return (
            <section
              id={section.id}
              key={section.id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 scroll-mt-24"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary-600/20 text-primary-300 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{section.summary}</p>
                </div>
              </div>

              {section.steps?.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-200 mb-2">Step-by-Step</h3>
                  <ol className="space-y-2 list-decimal list-inside text-sm text-gray-300">
                    {section.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {section.checks?.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-200 mb-2">Validation Checklist</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {section.checks.map((check) => (
                      <li key={check} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {section.faqs?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-200 mb-2">Questions</h3>
                  <div className="space-y-2">
                    {section.faqs.map((item) => (
                      <details key={item.q} className="rounded-lg border border-gray-700 bg-gray-700 p-3">
                        <summary className="text-sm font-medium text-white cursor-pointer select-none">
                          {item.q}
                        </summary>
                        <p className="mt-2 text-sm text-gray-300">{item.a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {filteredDocs.length === 0 && matchingRoles.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-300 text-sm">No setup paths match your search.</p>
        </div>
      )}
    </div>
  )
}

export default Documentation
