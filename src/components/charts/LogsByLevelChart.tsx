import { useEffect, useMemo, useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

type CowrieEvent = {
  timestamp: string
  label: 0 | 1
}

function parseNdjson(text: string): CowrieEvent[] {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const o = JSON.parse(line)
      return { timestamp: String(o.timestamp), label: Number(o.label) as 0 | 1 }
    })
}

function parseClockToSeconds(hms: string): number {
  const m = /^(\d{1,2}):(\d{2}):(\d{2})$/.exec(hms.trim())
  if (!m) return 0
  const [_, h, mi, s] = m
  return Number(h) * 3600 + Number(mi) * 60 + Number(s)
}

function eventSecondsLocal(ts: string): number {
  const d = new Date(ts)
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
}

export default function CowrieLabelChartProgressive({
  dataUrl = "/api/logs/charts",
  stepMs = 250,
  loop = true,
  startAt = "18:05:40",
}: {
  dataUrl?: string
  stepMs?: number
  loop?: boolean
  startAt?: string
}) {
  const [rows, setRows] = useState<CowrieEvent[]>([])
  const [cursorCount, setCursorCount] = useState(0)
  const [startIdx, setStartIdx] = useState(0)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(dataUrl, { headers: { Accept: "application/json, text/plain, */*" } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const ct = res.headers.get("content-type") || ""
        let data: CowrieEvent[] = []

        if (ct.includes("application/json")) {
          const j = await res.json()
          const arr: any[] = Array.isArray(j) ? j : j.events || []
          data = arr.map((o) => ({ timestamp: String(o.timestamp), label: Number(o.label) as 0 | 1 }))
        } else {
          data = parseNdjson(await res.text())
        }

        data.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))

        if (!alive) return

        const targetSec = parseClockToSeconds(startAt)
        let idx = 0
        for (let i = 0; i < data.length; i++) {
          if (eventSecondsLocal(data[i].timestamp) >= targetSec) { idx = i; break }
          if (i === data.length - 1) idx = 0
        }

        setRows(data)
        setStartIdx(idx)
        setCursorCount(data.length ? 1 : 0)
      } catch (e: any) {
        if (alive) setErr(String(e))
      }
    })()
    return () => { alive = false }
  }, [dataUrl, startAt])

  useEffect(() => {
    if (rows.length === 0) return
    const id = window.setInterval(() => {
      setCursorCount((n) => {
        const next = n + 1
        return next > rows.length ? (loop ? 1 : rows.length) : next
      })
    }, stepMs)
    return () => window.clearInterval(id)
  }, [rows.length, stepMs, loop])

  const data = useMemo(() => {
    if (rows.length === 0 || cursorCount === 0) return []
    const end = Math.min(startIdx + cursorCount, rows.length)
    const slice = rows.slice(startIdx, end)
    return slice.map((r) => ({
      x: new Date(r.timestamp).getTime(),
      label: r.label,
    }))
  }, [rows, startIdx, cursorCount])

  const fmtTick = (ms: number) =>
    new Date(ms).toLocaleTimeString("en-GB", { hour12: false })

  return (
    <div className="rounded-xl border border-white/10 bg-[#17181B] p-4">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="font-semibold text-white">Cowrie labels over time</h3>
        <span className="text-xs text-white/50">
          {Math.min(cursorCount, rows.length)}/{rows.length} points
        </span>
      </div>

      {err && <div className="text-red-400 text-sm mb-2">Failed to load: {err}</div>}

      {data.length === 0 ? (
        <div className="text-white/60 text-sm">Waiting for data…</div>
      ) : (
        <div className="relative overflow-hidden" style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 36, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={["auto", "auto"]}
                tickFormatter={fmtTick}
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              />
              <YAxis
                dataKey="label"
                domain={[0, 1]}
                ticks={[0, 1]}
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              />
              <Tooltip
                position={{ y: 8 }}
                allowEscapeViewBox={{ x: true, y: false }}
                wrapperStyle={{ pointerEvents: "none", zIndex: 50 }}
                contentStyle={{ background: "#111318", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                labelFormatter={(ms) => fmtTick(Number(ms))}
                formatter={(v) => [String(v), "label"]}
              />
              <Line
                type="stepAfter"
                dataKey="label"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 1.75, fill: "#22c55e", strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
