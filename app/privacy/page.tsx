"use client";
import { useApp } from "../context/AppContext";

export default function PrivacyPage() {
  const { theme } = useApp();
  const prose = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const heading = theme === "dark" ? "text-white" : "text-gray-900";

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className={`font-display text-4xl font-bold mb-2 ${heading}`}>Privacy Policy</h1>
      <p className={`text-sm italic mb-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Last updated: January 2026</p>
      <div className={`space-y-6 text-sm leading-relaxed ${prose}`}>
        <p>Veridict is a decentralized task verification platform built on GenLayer. We do not collect, store, or sell any personal data.</p>
        <p>All interactions on Veridict are conducted via your connected wallet address. No email, name, or personal information is required or stored.</p>
        <p>Submission links you provide are stored on-chain and are publicly visible as part of the verification process.</p>
        <p>Points earned on Veridict are non-transferable, have no monetary value, and are not tied to any external rewards program including GenLayer portal points.</p>
        <p>By using Veridict you acknowledge that this is an MVP platform and interactions are experimental in nature.</p>
      </div>
    </div>
  );
}
