// src/components/TerminalView.tsx
import { useEffect, useRef } from "react"
import { Terminal, type ITerminalOptions, type ITheme } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"

type NetLog = {
  timestamp: string
  src_ip: string
  src_port: number
  dst_ip: string
  dst_port: number
  protocol: string
  session: string
  label: number
}

const THEME: ITheme = {
  background: "#0f1115",
  foreground: "#e5e7eb",
  cursor: "#e5e7eb",
  selectionBackground: "#33415588",
}

function format(ev: NetLog) {
  // format like a real terminal log
  return `${new Date(ev.timestamp).toISOString()} ${ev.protocol.toUpperCase()} ` +
         `${ev.src_ip}:${ev.src_port} -> ${ev.dst_ip}:${ev.dst_port} ` +
         `(session=${ev.session}, label=${ev.label})`
}

export default function TerminalView({
  logsUrl = "/json/simulated_cowrie_demo_hour.json",
  intervalMs = 1200, // faster playback
}: {
  logsUrl?: string
  intervalMs?: number
}) {
  const elRef = useRef<HTMLDivElement | null>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!elRef.current) return

    const opts: Partial<ITerminalOptions> = {
      fontSize: 14,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
      cursorBlink: true,
      theme: THEME,
    }

    const term = new Terminal(opts)
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(elRef.current)
    fit.fit()

    termRef.current = term
    fitRef.current = fit

    term.writeln("\x1b[38;5;82mFrotect network log playback\x1b[0m")

    const onResize = () => fit.fit()
    window.addEventListener("resize", onResize)

    requestAnimationFrame(() => term.focus())

    return () => {
      window.removeEventListener("resize", onResize)
      term.dispose()
      termRef.current = null
    }
  }, [])

  useEffect(() => {
    let timer: number | null = null
    let idx = 0
    let events: NetLog[] = []
    let cancelled = false

    const startLoop = () => {
      if (!termRef.current || events.length === 0) return

      const tick = () => {
        if (cancelled) return
        const ev = events[idx]
        termRef.current!.writeln(format(ev))
        idx = (idx + 1) % events.length
        timer = window.setTimeout(tick, intervalMs)
      }
      tick()
    }

    const load = async () => {
      try {
        const res = await fetch(logsUrl, {
          headers: { Accept: "application/json, text/plain, */*" },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const ct = res.headers.get("content-type") || ""

        if (ct.includes("application/json")) {
          const data = await res.json()
          events = Array.isArray(data) ? data : data.events
        } else {
          // fallback: NDJSON/plain text
          const text = await res.text()
          events = text.split(/\r?\n/).filter(Boolean).map((line, i) => ({
            timestamp: new Date(Date.now() + i * 1000).toISOString(),
            src_ip: "0.0.0.0",
            src_port: 0,
            dst_ip: "0.0.0.0",
            dst_port: 0,
            protocol: "tcp",
            session: `mock-${i}`,
            label: 0,
          }))
        }

        if (!Array.isArray(events) || events.length === 0) {
          throw new Error("No events found in payload")
        }

        startLoop()
      } catch (e) {
        termRef.current?.writeln(`[FETCH ERROR] ${String(e)}`)
      }
    }

    load()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [logsUrl, intervalMs])

  return <div ref={elRef} style={{ height: 300, width: "100%" }} />
}
