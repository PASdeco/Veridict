"use client";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "../context/AppContext";

const ecosystem = [
  { label: "GenLayer Main", href: "https://www.genlayer.com/" },
  { label: "Documentation", href: "https://docs.genlayer.com/" },
  { label: "Testnet Bradbury", href: "https://x.com/GenLayer/status/2031732035799200026?s=20" },
  { label: "Hackathon", href: "https://portal.genlayer.foundation/#/hackathon/" },
];

const community = [
  { label: "X / Twitter", href: "https://x.com/GenLayer?s=20" },
  { label: "Discord", href: "https://discord.gg/genlayerlabs" },
  { label: "GitHub", href: "https://github.com/genlayerlabs" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/genlayer-labs/" },
];

export default function Footer() {
  const { theme } = useApp();

  const linkClass = `text-sm transition-colors duration-200 ${
    theme === "dark"
      ? "text-gray-400 hover:text-violet-400"
      : "text-gray-500 hover:text-violet-600"
  }`;

  const headingClass = `text-xs font-bold uppercase tracking-widest mb-4 ${
    theme === "dark" ? "text-violet-400" : "text-violet-600"
  }`;

  const dividerClass = `border-t ${
    theme === "dark" ? "border-white/5" : "border-gray-200"
  }`;

  return (
    <footer className={`relative mt-20 ${
      theme === "dark"
        ? "bg-[#080b14]/90 border-t border-violet-900/30"
        : "bg-white/80 border-t border-violet-200/50"
    } navbar-blur`}>

      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.png"
                alt="Veridict"
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
              <span className={`font-display text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Veri<span className="text-gradient">dict</span>
              </span>
            </div>
            <p className={`text-sm leading-relaxed max-w-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              <span className={`font-semibold italic ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                The future of work —
              </span>{" "}
              where AI validates tasks and the community ensures fairness through decentralized consensus.
            </p>

            {/* Built on GenLayer badge */}
            <div className={`inline-flex items-center gap-2 mt-5 px-3 py-1.5 rounded-full border text-xs font-medium ${
              theme === "dark"
                ? "border-violet-800/50 bg-violet-900/20 text-violet-300"
                : "border-violet-200 bg-violet-50 text-violet-700"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 pulse-soft inline-block" />
              Built on GenLayer
            </div>
          </div>

          {/* Ecosystem column */}
          <div>
            <p className={headingClass}>Ecosystem</p>
            <ul className="space-y-3">
              {ecosystem.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} flex items-center gap-1.5 group`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-500 text-xs">→</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community column */}
          <div>
            <p className={headingClass}>Community</p>
            <ul className="space-y-3">
              {community.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} flex items-center gap-1.5 group`}
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-500 text-xs">→</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`${dividerClass} mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
            © 2026 Veridict. Built on GenLayer.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className={`text-xs transition-colors ${
                theme === "dark" ? "text-gray-500 hover:text-violet-400" : "text-gray-400 hover:text-violet-600"
              }`}
            >
              Privacy Policy
            </Link>
            <span className={theme === "dark" ? "text-gray-700" : "text-gray-300"}>·</span>
            <Link
              href="/terms"
              className={`text-xs transition-colors ${
                theme === "dark" ? "text-gray-500 hover:text-violet-400" : "text-gray-400 hover:text-violet-600"
              }`}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
