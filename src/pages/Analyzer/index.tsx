import { useEffect, useMemo, useState } from "react"
import { FileText, Download, ExternalLink, Filter } from "lucide-react"

type PdfReport = {
  id: string
  name: string
  url: string
  sizeBytes: number
  createdAt: string // ISO
  tags: string[]
}

// fallback demo data (used if fetch fails)
const FALLBACK: PdfReport[] = [
  {
    id: "rpt-001",
    name: "Incident Summary – Web App (Sep 2025).pdf",
    url: "/docs/incident-summary-sep-2025.pdf",
    sizeBytes: 824_320,
    createdAt: "2025-09-18T09:30:00Z",
    tags: ["incident", "security"],
  },
  {
    id: "rpt-002",
    name: "Weekly Threat Intel Digest.pdf",
    url: "/docs/threat-intel-weekly.pdf",
    sizeBytes: 512_008,
    createdAt: "2025-09-17T07:05:00Z",
    tags: ["intel", "security"],
  },
  {
    id: "rpt-003",
    name: "Compliance Checklist – Q3.pdf",
    url: "/docs/compliance-q3.pdf",
    sizeBytes: 1_224_000,
    createdAt: "2025-09-10T12:00:00Z",
    tags: ["compliance"],
  },
  {
    id: "rpt-004",
    name: "Capacity & Performance Report.pdf",
    url: "/docs/capacity-performance.pdf",
    sizeBytes: 2_048_120,
    createdAt: "2025-09-05T15:12:00Z",
    tags: ["infra", "metrics"],
  },
  {
    id: "rpt-005",
    name: "Quarterly Risk Posture.pdf",
    url: "/docs/risk-posture-q3.pdf",
    sizeBytes: 1_104_555,
    createdAt: "2025-08-30T10:00:00Z",
    tags: ["risk", "security"],
  },
]

function formatBytes(n: number) {
  if (!Number.isFinite(n)) return "-"
  const units = ["B", "KB", "MB", "GB"]
  let i = 0
  let v = n
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AnalyzerPage({ dataUrl = "/json/mock-reports.json" }: { dataUrl?: string }) {
  const [reports, setReports] = useState<PdfReport[]>([])
  const [err, setErr] = useState<string | null>(null)

  // filters
  const [query, setQuery] = useState("")
  const [tag, setTag] = useState<"all" | string>("all")
  const [sort, setSort] = useState<"new" | "old" | "name">("new")

  // load list (tries JSON at dataUrl, falls back to built-in)
  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        const res = await fetch(dataUrl, { headers: { Accept: "application/json, */*" } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        const arr: PdfReport[] = Array.isArray(j) ? j : j.reports
        if (on) setReports(Array.isArray(arr) ? arr : FALLBACK)
      } catch (e: any) {
        if (on) {
          setReports(FALLBACK)
          setErr(String(e))
        }
      }
    })()
    return () => { on = false }
  }, [dataUrl])

  // tags from data
  const allTags = useMemo(() => {
    const s = new Set<string>()
    for (const r of reports) r.tags.forEach(t => s.add(t))
    return Array.from(s).sort()
  }, [reports])

  // filter + sort
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = reports.filter(r => {
      const okTag = tag === "all" || r.tags.includes(tag)
      const okText =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      return okTag && okText
    })

    switch (sort) {
      case "new":
        list = list.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        break
      case "old":
        list = list.slice().sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        break
      case "name":
        list = list.slice().sort((a, b) => a.name.localeCompare(b.name))
        break
    }
    return list
  }, [reports, query, tag, sort])

  return (
    <div className="p-3">
      <div className="rounded-2xl border border-white/10 bg-[#17181B] shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 opacity-80" />
            <h2 className="text-base font-semibold">Analyzer — Reports (PDF)</h2>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-white/50">
            {err && <span className="text-red-400">Loaded fallback • {err}</span>}
            <span>{filtered.length}/{reports.length} shown</span>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 pt-3">
          <div className="flex flex-col md:flex-row gap-2">
            {/* search */}
            <div className="relative md:w-1/2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports or tags…"
                className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 pr-9 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            </div>

            {/* tag */}
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            >
              <option value="all">All tags</option>
              {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            >
              <option value="new">Newest</option>
              <option value="old">Oldest</option>
              <option value="name">Name A→Z</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white/90">
            <thead>
              <tr className="border-y border-white/10 bg-white/[0.03]">
                <th className="text-left font-semibold px-4 py-2">Name</th>
                <th className="text-left font-semibold px-4 py-2">Tags</th>
                <th className="text-left font-semibold px-4 py-2">Size</th>
                <th className="text-left font-semibold px-4 py-2">Created</th>
                <th className="text-right font-semibold px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                    No reports match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/10 hover:bg-white/[0.03]">
                  <td className="px-4 py-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-white hover:text-white"
                    >
                      <FileText className="h-4 w-4 opacity-80" />
                      <span className="underline decoration-white/20 underline-offset-2">{r.name}</span>
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/75">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">{formatBytes(r.sizeBytes)}</td>
                  <td className="px-4 py-2">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 hover:bg-white/[0.12]"
                        title="Open"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </a>
                      <a
                        href={r.url}
                        download
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-emerald-600/90 px-2.5 py-1 hover:bg-emerald-500"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
