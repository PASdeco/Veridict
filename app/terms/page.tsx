"use client";
import { useApp } from "../context/AppContext";

export default function TermsPage() {
  const { theme } = useApp();
  const prose = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const heading = theme === "dark" ? "text-white" : "text-gray-900";

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className={`font-display text-4xl font-bold mb-2 ${heading}`}>Terms of Service</h1>
      <p className={`text-sm italic mb-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Last updated: January 2026</p>
      <div className={`space-y-6 text-sm leading-relaxed ${prose}`}>
        <p>By accessing and using Veridict you agree to these terms. Veridict is provided as-is as an MVP demonstration platform.</p>
        <p>You must connect a valid EVM-compatible wallet to use the platform. You are solely responsible for the security of your wallet and private keys.</p>
        <p>Task submissions must be genuine proof-of-work links. Submitting fraudulent or misleading links may result in rejection by the AI review system or community dispute.</p>
        <p>Points awarded on Veridict carry no monetary value, are not redeemable, and are not affiliated with or tied to GenLayer portal points or any other rewards system.</p>
        <p>The moderator reserves the right to remove tasks or submissions that violate community standards or the spirit of the platform.</p>
        <p>Veridict is built on GenLayer technology. Use of this platform is subject to GenLayer&apos;s own terms and conditions.</p>
      </div>
    </div>
  );
}
