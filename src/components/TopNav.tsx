"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, ShieldAlert } from "lucide-react";
import { useGreenhouse } from "@/hooks/useGreenhouse";

export function TopNav() {
  const { alerts, dismissAlert } = useGreenhouse();
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateStr(d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "/analytics" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md shadow-sm">
      {/* Brand Logo & Title */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
        <Image
          src="/logo.png"
          alt="Smart Greenhouse Logo"
          width={38}
          height={38}
          className="rounded-lg object-contain"
          priority
        />
        <div className="flex flex-col">
          <span className="font-sans text-sm font-extrabold tracking-tight text-foreground leading-none">
            Smart Greenhouse
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
            IoT Portal
          </span>
        </div>
      </Link>

      {/* Navigation links (kept in TopNav now) */}
      <div className="hidden md:flex items-center gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-xl px-4 py-2.5 text-xs font-bold tracking-wide transition-all duration-200 ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Date & Time / Notifications */}
      <div className="flex items-center gap-5">
        {/* Date & Time */}
        <div className="hidden sm:flex flex-col items-end text-right border-r border-border/60 pr-5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            {dateStr || "Server Ticker"}
          </span>
          <span className="font-mono text-sm font-bold text-foreground">
            {timeStr || "00:00:00"}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus:outline-none relative cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-card animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-card p-4 shadow-xl z-50 glass">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
                <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-red-500" /> Notifications
                </span>
                <span className="text-xs text-muted-foreground">{alerts.length} Active</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {alerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    All operations normal. No alerts triggered.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-border bg-card/40 p-2.5 text-xs transition-colors hover:bg-card"
                    >
                      <div className="flex justify-between items-start font-semibold text-foreground mb-1">
                        <span className={alert.severity === "critical" ? "text-red-500" : "text-amber-500"}>
                          {alert.sensor}
                        </span>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
