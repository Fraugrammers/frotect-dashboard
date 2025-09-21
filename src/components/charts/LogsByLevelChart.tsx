import { useEffect, useMemo, useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts"

type LogEvent = {
  id: string
  ts: string
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "AUTH" | "ATTACK"
  service: string
  host: string
  message: string
  meta?: Record<string, unknown>
}

const LEVELS = ["DEBUG", "INFO", "WARN", "ERROR", "AUTH", "ATTACK"] as const
const COLORS: Record<(typeof LEVELS)[number], string> = {
  DEBUG: "#9ca3af",
  INFO:  "#3b82f6",
  WARN:  "#f59e0b",
  ERROR: "#ef4444",
  AUTH:  "#06b6d4",
  ATTACK:"#a855f7",
}

function parsePayload(raw: unknown): LogEvent[] {
  if (Array.isArray(raw)) return raw as LogEvent[]
  if (raw && typeof raw === "object" && Array.isArray((raw as any).events)) {
    return (raw as any).events as LogEvent[]
  }
  return []
}

function bucketKey(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString("en-GB", { hour12: false })
}

export default function LogsByLevelChart({
  logsUrl = "/mock-logs.json",
  stepMs = 1500,
}: { logsUrl?: string; stepMs?: number }) {
  const [all, setAll] = useState<LogEvent[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [cursor, setCursor] = useState(0)
  const [hidden, setHidden] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let on = true
    ;(async () => {
      try {
        const res = await fetch(logsUrl, { headers: { Accept: "application/json, text/plain, */*" } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const ct = res.headers.get("content-type") || ""
        let data: LogEvent[] = []
        if (ct.includes("application/json")) {
          data = parsePayload(await res.json())
        } else {
          const text = await res.text()
          data = text.split(/\r?\n/).filter(Boolean).map((line, i) => ({
            id: String(i + 1),
            ts: new Date(Date.now() + i * 1000).toISOString(),
            level: "INFO",
            service: "raw",
            host: "demo",
            message: line,
          }))
        }
        if (on) {
          setAll(data)
        }
      } catch (e: any) {
        if (on) setErr(String(e))
      }
    })()
    return () => { on = false }
  }, [logsUrl])

  useEffect(() => {
    if (all.length === 0) return
    const id = window.setInterval(() => {
      setCursor(prev => (prev + 1 > all.length ? 1 : prev + 1))
    }, stepMs)
    return () => window.clearInterval(id)
  }, [all.length, stepMs])

  const visible = useMemo(
    () => all.slice(0, Math.max(0, Math.min(cursor, all.length))),
    [all, cursor]
  )

  const data = useMemo(() => {
    const map = new Map<string, Record<string, number>>()
    const order: string[] = []
    for (const ev of visible) {
      const key = bucketKey(ev.ts)
      if (!map.has(key)) {
        map.set(key, Object.fromEntries(LEVELS.map(l => [l, 0])) as Record<string, number>)
        order.push(key)
      }
      const row = map.get(key)!
      row[ev.level] = (row[ev.level] || 0) + 1
    }
    return order.map(t => ({ t, ...(map.get(t) as Record<string, number>) }))
  }, [visible])

  const handleLegendClick = (o: any) => {
    const key = o?.dataKey as string
    setHidden(h => ({ ...h, [key]: !h[key] }))
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#17181B] p-4">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="font-semibold text-white">Logs by level</h3>
        <span className="text-xs text-white/50">{visible.length}/{all.length} lines</span>
      </div>

      {err && <div className="text-red-400 text-sm mb-2">Failed to load: {err}</div>}

      {data.length === 0 ? (
        <div className="text-white/60 text-sm">Waiting for data…</div>
      ) : (
        <div className="relative overflow-hidden" style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 40, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="t" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />

              <Legend wrapperStyle={{ color: "#fff" }} onClick={handleLegendClick} />

              <Tooltip
                position={{ y: 8 }}                                
                allowEscapeViewBox={{ x: true, y: false }}
                wrapperStyle={{ pointerEvents: "none", zIndex: 50 }}
                contentStyle={{ background: "#111318", border: "1px solid rgba(255,255,255,0.1)" }}
                labelStyle={{ color: "#fff" }}
              />

              {LEVELS.map((lvl) => (
                <Area
                  key={lvl}
                  type="monotone"
                  dataKey={lvl}
                  stackId="1"
                  stroke={COLORS[lvl]}
                  fill={COLORS[lvl]}
                  fillOpacity={0.35}
                  strokeWidth={2}
                  isAnimationActive={false}
                  hide={!!hidden[lvl]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
