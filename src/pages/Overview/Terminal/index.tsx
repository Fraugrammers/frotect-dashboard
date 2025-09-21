// src/components/TerminalView.tsx
import { useEffect, useRef } from "react"
import { Terminal, type ITerminalOptions, type ITheme } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"

type LogEvent = {
  id: string
  ts: string
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "AUTH" | "ATTACK"
  service: string
  host: string
  message: string
  meta?: Record<string, unknown>
}

const THEME: ITheme = {
  background: "#0f1115",
  foreground: "#e5e7eb",
  cursor: "#e5e7eb",
  selectionBackground: "#33415588",
}

const C = {
  DEBUG: "\x1b[38;5;244m",
  INFO: "\x1b[38;5;33m",
  WARN: "\x1b[38;5;214m",
  ERROR: "\x1b[31m",
  AUTH: "\x1b[36m",
  ATTACK: "\x1b[35m",
  RESET: "\x1b[0m",
}

function format(ev: LogEvent) {
  const t = new Date(ev.ts).toISOString()
  const meta = ev.meta
    ? " " + Object.entries(ev.meta).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(" ")
    : ""
  const color = C[ev.level] ?? ""
  return `${color}[${ev.level}]${C.RESET} ${t} ${ev.host} ${ev.service} - ${ev.message}${meta}`
}

export default function TerminalView({
  logsUrl = "/mock-logs.json",
  intervalMs = 1500,
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

    term.writeln("\x1b[38;5;82mFrotect demo log playback\x1b[0m")

    const onResize = () => fit.fit()
    window.addEventListener("resize", onResize)

    requestAnimationFrame(() => term.focus());

    return () => {
      window.removeEventListener("resize", onResize)
      term.dispose()
      termRef.current = null
    }
  }, [])

  useEffect(() => {
    let timer: number | null = null
    let idx = 0
    let events: LogEvent[] = []
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
        const ct = res.headers.get("content-type") || ""
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        if (ct.includes("application/json")) {
          const data = await res.json()
          events = Array.isArray(data) ? data : data.events
        } else {
          const text = await res.text()
          events = text
            .split(/\r?\n/)
            .filter(Boolean)
            .map((line, i) => ({
              id: String(i + 1),
              ts: new Date(Date.now() + i * 1000).toISOString(),
              level: "INFO",
              service: "raw",
              host: "demo",
              message: line,
            }))
        }

        if (!Array.isArray(events) || events.length === 0) {
          throw new Error("No events found in payload")
        }

        startLoop()
      } catch (e) {
        termRef.current?.writeln(`${C.ERROR}[FETCH] ${String(e)}${C.RESET}`)
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
