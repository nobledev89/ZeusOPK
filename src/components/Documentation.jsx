import { useMemo, useState } from 'react'
import {
  BookOpen,
  Search,
  CheckCircle2,
  Wrench,
  Shield,
  Users,
  ShoppingBag,
  Bot,
  ServerCog,
  MessageSquareMore,
  AlertTriangle,
  Rocket,
  HelpCircle
} from 'lucide-react'

const docs = [
  {
    id: 'overview',
    title: 'Platform Overview',
    icon: BookOpen,
    summary: 'How Zeus OPK Manager and the Admin Portal fit together.',
    steps: [
      'Use the Admin Portal to manage users, sessions, tiers, game server metadata, logs, and global app settings.',
      'Use Zeus OPK Manager (desktop app) to create bot accounts and configure bot behavior per account folder.',
      'Most bot behavior is file-based per account (`control/config.txt`, `items_control.txt`, `macros.txt`, etc.), so settings are account-specific unless copied from a template/duplicate.'
    ],
    checks: [
      'Admin team can sign in to the web portal.',
      'Desktop users can open bot settings and save configs.',
      'Each bot folder has a `control` directory.'
    ]
  },
  {
    id: 'new-account-checklist',
    title: 'New Account Setup Checklist',
    icon: CheckCircle2,
    summary: 'Fast path for creating a reliable new bot account.',
    steps: [
      'Create bot from template (or duplicate a known-good account if you want the same behavior copied).',
      'Set account type first: Combat, Support, or Collector.',
      'In Login tab, set server credentials, character slot, lock map, and optional OTP seed.',
      'Enable "Run @security automatically on every login" and set security PIN.',
      'Set item pickup/sell/storage settings.',
      'If using collector workflow, configure collector settings and allowed names before starting.',
      'Run the bot and verify logs for successful security and deal flow.'
    ],
    checks: [
      'Security macro runs on startup.',
      'No empty required fields for collector/support workflow.',
      'Bot reaches map/coordinates and performs expected action.'
    ]
  },
  {
    id: 'account-types',
    title: 'Account Types: Combat, Support, Collector',
    icon: Users,
    summary: 'When to use each account type and what it changes.',
    steps: [
      'Combat: normal farming/looting account.',
      'Support: non-combat helper with follow/party automation and skill automation.',
      'Collector: dedicated receiver/storage/selling/vending account for other bots.',
      'Collector account defaults disable attack/pickup combat flow and focus on deal/shop/storage behavior.'
    ],
    checks: [
      'Account type in settings matches intended role.',
      'Support and Collector accounts are not left in combat defaults.'
    ]
  },
  {
    id: 'security',
    title: 'Security and Login PIN',
    icon: Shield,
    summary: 'How @security is triggered every login for all account types.',
    steps: [
      'Enable "Run @security automatically on every login" in bot settings.',
      'Set a valid security PIN so the macro can complete menu input (`do talk text <pin>`).',
      'Save settings; manager updates `macros.txt` with startup hook and security macro.',
      'On next login, confirm from logs that security flow completed before other sensitive actions (deal/shop).'
    ],
    checks: [
      'PIN is not empty or outdated.',
      'Macro exists and startup hook is present.',
      'No repeated security prompt loop in logs.'
    ]
  },
  {
    id: 'items-sell-storage',
    title: 'Items, Auto-Sell, and Auto-Storage',
    icon: ShoppingBag,
    summary: 'Correct placement of sell settings and storage behavior.',
    steps: [
      'Configure NPC sell coordinates in Items > Auto-Sell tab (`sellAuto_npc`).',
      'Enable/disable NPC auto-sell there (`sellAuto`) and maintain the Auto-Sell item list.',
      'Configure Storage NPC in Items > Storage tab (`storageAuto_npc`).',
      'If collector workflow is enabled for a bot, collector Kafra settings override normal auto-storage Kafra behavior.'
    ],
    checks: [
      'Auto-Sell tab has correct NPC map and coordinates.',
      'Storage tab Kafra NPC is valid when fallback storage is expected.',
      'Item IDs in `items_control.txt` match intended sell/store flags.'
    ]
  },
  {
    id: 'collector-delivery-bot',
    title: 'Collector Workflow: Delivery Bot Setup',
    icon: Bot,
    summary: 'How regular bots deliver loot to a collector account.',
    steps: [
      'Enable collector workflow on the delivery bot.',
      'Set collector character name, collection map, and collection coordinates.',
      'Set delivery weight threshold and trade distance.',
      'Use matching collector name and map/coords that the collector can actually reach.',
      'Keep security-on-login enabled so deal flow is allowed when required.'
    ],
    checks: [
      'Collector name is exact (case-insensitive matching still expects correct name).',
      'Both bots are on same map context when trading starts.',
      'Logs show move-to-collector then deal attempt.'
    ]
  },
  {
    id: 'collector-account',
    title: 'Collector Account Setup (Vending and Deal Control)',
    icon: ServerCog,
    summary: 'Full collector account behavior, including vending and storage fallback.',
    steps: [
      'Set account type to Collector.',
      'Enable automatic vending if desired.',
      'Enable "Close shop when allowed bot is nearby to start trade" for smoother handoff.',
      'Populate allowed bot names list (one per line) so only approved bots transact.',
      'Set shop title and shop items (item ID, name, price, amount).',
      'Enable direct NPC selling only when needed; it uses Auto-Sell item list and Auto-Sell NPC coordinates.',
      'Set collector Kafra settings and store-to-kafra weight threshold to avoid overweight stalls.'
    ],
    checks: [
      'Allowed bot names include every delivery bot.',
      'Shop item IDs and names are valid and match inventory.',
      'Collector has reachable Kafra fallback for cart/full inventory states.'
    ]
  },
  {
    id: 'support-setup',
    title: 'Support Account Setup',
    icon: Users,
    summary: 'Support core behavior, follow/party automation, and support/self skills.',
    steps: [
      'Set account type to Support.',
      'In Support Core, enable no-attack mode and follow behavior as needed.',
      'Set follow target and min/max follow distance.',
      'Configure lock map and optional loot behavior.',
      'Set party automation: auto-create, auto-invite from `party.txt`, auto-approve party invites.',
      'Set security PIN and enable security on login.',
      'Use Party Skills and Self Skills tabs to configure trigger conditions and cooldowns.'
    ],
    checks: [
      'Follow target is online and reachable.',
      'Party members list format is valid (`Name 1`).',
      'Skill rules are enabled and have sane cooldown values.'
    ]
  },
  {
    id: 'chat-ai',
    title: 'Chat and AI Reply Configuration',
    icon: MessageSquareMore,
    summary: 'Per-bot chat behavior plus global AI provider controls in Admin Portal.',
    steps: [
      'Use bot Chat tab for static keyword replies and bot-level AI behavior toggles.',
      'Use Admin Portal Settings for global AI provider keys, model selection, fallback order, and timeouts.',
      'Test provider connection in portal before enabling globally.',
      'Tune cooldown, max reply length, and memory settings to reduce spam-like behavior.'
    ],
    checks: [
      'Global API key exists for selected provider.',
      'Bot has AI enabled if you expect responses.',
      'Public trigger prefix is set if public chat mode is on.'
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting: Deals, Lag, Crashes, Session Expiry',
    icon: AlertTriangle,
    summary: 'Most common runtime issues and quick diagnostics.',
    steps: [
      'Deal not starting: verify collector/delivery names, allowed list, map proximity, and security completion logs.',
      'Bot not giving loot: check weight threshold, trade distance, and whether collector is visible on map.',
      'Shop does not reopen: verify auto-vending enabled and close-for-trade logic not blocked by ongoing state.',
      'Lag/crash after minutes: inspect process memory/CPU, check repetitive log loops, and reduce aggressive polling/macros.',
      'Session expired: review timeout policy in portal settings and ensure client clocks/network are stable.'
    ],
    checks: [
      'Always inspect both sides: delivery bot log and collector bot log.',
      'Confirm there is no stale/dead process using old binaries.',
      'Validate config saved to the correct account folder.'
    ]
  },
  {
    id: 'release',
    title: 'Build and Release Deployment',
    icon: Rocket,
    summary: 'How to ensure users run the updated binary.',
    steps: [
      'Use one release path consistently (recommended: `bin/Release/net8.0-windows`).',
      'Close running ZeusOPK process before overwriting that exact output path.',
      'Run Release build, then verify updated timestamp for `ZeusOPK.exe` in the target path.',
      'Avoid mixing alternate output folders unless intentionally used for hotfix testing.'
    ],
    checks: [
      'Only one active release executable path is distributed.',
      'Running process path matches the freshly built file path.',
      'Users are not launching old Debug or archived builds.'
    ]
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: HelpCircle,
    summary: 'Answers to frequent operator questions.',
    faqs: [
      {
        q: 'Will collector/support features work for new accounts?',
        a: 'Yes, the logic is account-type and setting driven, not hardcoded to one bot name. New accounts must still be configured or duplicated from a configured account.'
      },
      {
        q: 'Where do I set NPC coordinates for direct item selling?',
        a: 'In Items > Auto-Sell tab using the Sell NPC field. This is separate from Storage NPC.'
      },
      {
        q: 'Does collector workflow override normal Kafra auto-storage?',
        a: 'Yes. When collector workflow is enabled, collector Kafra behavior overrides regular auto-storage Kafra behavior.'
      },
      {
        q: 'Why am I still seeing old behavior after a build?',
        a: 'You are likely launching a different executable path than the one you rebuilt.'
      },
      {
        q: 'Should auto-sell item list be empty?',
        a: 'Yes, empty is valid. It simply means no items are selected for direct NPC auto-sell.'
      },
      {
        q: 'Why does @security not run?',
        a: 'Confirm the per-account login security toggle is enabled and a valid security PIN is saved in that account settings.'
      }
    ]
  }
]

const normalized = (value) => (value || '').toLowerCase()

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
  const query = normalized(queryInput.trim())

  const filteredDocs = useMemo(
    () => docs.filter(section => sectionMatchesQuery(section, query)),
    [query]
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
        <p className="text-gray-400">
          Tutorial-style guide for setup, daily operations, and troubleshooting.
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
              Search by keyword (example: collector, security, auto-sell, support, crash).
            </p>
          </div>
        </div>

        <label className="relative block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Search documentation..."
            className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <p className="mt-3 text-xs text-gray-500">
          Showing {filteredDocs.length} of {docs.length} sections.
        </p>
      </div>

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
                        <Wrench className="w-4 h-4 text-primary-300 mt-0.5 shrink-0" />
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
                      <details key={item.q} className="rounded-lg border border-gray-700 bg-gray-750 p-3">
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

      {filteredDocs.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-300 text-sm">No documentation sections match your search.</p>
        </div>
      )}
    </div>
  )
}

export default Documentation
