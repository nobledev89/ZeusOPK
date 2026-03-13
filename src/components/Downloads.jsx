import { ExternalLink, FolderOpen, Github, FileArchive } from 'lucide-react'

const downloadSources = [
  {
    id: 'google-drive',
    title: 'Google Drive Folder',
    description: 'Browse shared ZeusOPK files directly from Drive.',
    href: 'https://drive.google.com/drive/folders/1Ke7RUpo9IQt_vqCKWHVIGcWEmCcDHdNZ',
    icon: FolderOpen
  },
  {
    id: 'github-release',
    title: 'GitHub Release (OPK)',
    description: 'Open the official OPK release page on GitHub.',
    href: 'https://github.com/nobledev89/ZeusOPK-Dist/releases/tag/OPK',
    icon: Github
  }
]

const Downloads = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-8">
        <p className="inline-block text-xs uppercase tracking-[0.25em] text-cyan-300 mb-3">ZeusOPK Downloads</p>
        <h1 className="text-3xl md:text-4xl font-black leading-tight text-white">Download Sources</h1>
        <p className="mt-3 text-slate-300 max-w-3xl">
          Use the links below to access the latest ZeusOPK distribution files.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {downloadSources.map(({ id, title, description, href, icon: Icon }) => (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-xl border border-slate-700 bg-slate-900/70 p-5 hover:bg-slate-800/80 transition-colors"
          >
            <div className="inline-flex p-2 rounded-lg bg-cyan-500/15 text-cyan-300 mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-300">{description}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-300 group-hover:text-cyan-200">
              Open link
              <ExternalLink className="w-4 h-4" />
            </p>
          </a>
        ))}
      </section>

      <section className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-5">
        <div className="flex items-start gap-3">
          <div className="inline-flex p-2 rounded-lg bg-amber-400/20 text-amber-200 shrink-0">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-amber-100">Important Download Note</h2>
            <p className="mt-2 text-sm text-amber-50/90">
              From the GitHub release page, open the <span className="font-semibold">Assets</span> section and download{' '}
              <span className="font-semibold">ZeusOPK-Dist1.3.zip</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Downloads
