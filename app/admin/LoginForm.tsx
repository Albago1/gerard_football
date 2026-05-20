"use client";

import { useSearchParams } from "next/navigation";
import { login } from "./actions";

export default function LoginForm() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-4 h-px bg-[#e11d48]" />
            <span className="text-zinc-500 text-xs font-semibold tracking-[0.25em] uppercase">
              Admin
            </span>
          </div>
          <h1 className="font-heading font-black text-white uppercase text-3xl">
            Video Dashboard
          </h1>
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label className="text-zinc-500 text-xs uppercase tracking-widest block mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 text-sm focus:outline-none focus:border-[#e11d48] transition-colors"
            />
          </div>
          {error && (
            <p className="text-[#e11d48] text-xs font-semibold uppercase tracking-wide">
              Incorrect password
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white font-bold text-xs uppercase tracking-[0.15em] py-3.5 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
