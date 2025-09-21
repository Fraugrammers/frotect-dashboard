import { useEffect, useMemo, useState } from "react"

type Props = {
  city: string
  country?: string
  tzLabel?: string
  temperature?: string
  variant?: "sidebar" | "full"
  className?: string
}

export default function TimeCard({
  city,
  country,
  tzLabel = "UTC",
  temperature = "—",
  variant = "sidebar",
  className,
}: Props) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const day = useMemo(
    () => new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(now),
    [now]
  )

  const dateText = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(now),
    [now]
  )

  const timeText = useMemo(() => {
    const h = now.getHours().toString().padStart(2, "0")
    const m = now.getMinutes().toString().padStart(2, "0")
    const s = now.getSeconds().toString().padStart(2, "0")
    return `${h}:${m}:${s}`
  }, [now])

  const heightPx = variant === "sidebar" ? 180 : 260

  return (
    <div
      className={[
        "relative rounded-xl border border-white/10 bg-[#16171a] text-white",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_10px_30px_rgba(0,0,0,0.4)]",
        "overflow-hidden",
        className || "",
      ].join(" ")}
      style={{
        height: heightPx,
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "6px 6px",
      }}
    >
      <div className="relative h-full flex flex-col px-4 py-3">
        <div className="flex items-center justify-between text-[10px] tracking-widest opacity-80">
          <span className="uppercase">{day}</span>
          <span className="uppercase">{dateText}</span>
        </div>

        <div className="flex-1 grid place-items-center">
            <div
                className="font-extrabold tracking-widest py-0"
                style={{
                fontSize:
                    variant === "sidebar"
                    ? "clamp(16px, 8vw, 26px)"
                    : "clamp(28px, 8vw, 48px)",
                lineHeight: "1",
                }}
            >
                {timeText}
            </div>
        </div>


        <div className="flex items-center justify-between text-[10px] tracking-widest opacity-80">
          <span className="uppercase truncate">
            {city}
            {country ? `, ${country}` : ""}
          </span>
          <span>{tzLabel}</span>
        </div>
      </div>
    </div>
  )
}
