"use client";

import { motion } from "framer-motion";
import { LoaderCircle, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";

function Field({ label, value, onChange, placeholder, type = "text", autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={onChange}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-full border-[3px] border-black bg-white px-4 text-sm font-semibold text-ink outline-none shadow-[5px_5px_0_0_#111] placeholder-ink-muted"
      />
    </label>
  );
}

export function AuthPanel({
  authState,
  authForm,
  setAuthForm,
  authBusy,
  authMessage,
  onSubmit,
  onLogout,
  onRefresh
}) {
  const signedIn = Boolean(authState?.session);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[28px] border-[3px] border-black bg-[#f7f2e8] p-4 shadow-[8px_8px_0_0_#111]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-ink-muted">
            Access control
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-black tracking-[-0.05em] text-ink">
            Sign-in gate for the live prototype
          </h3>
        </div>
        <div
          className={`rounded-full border-[3px] border-black px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_0_#111] ${
            signedIn ? "bg-[#a7f3d0]" : "bg-[#ffe98a]"
          }`}
        >
          {signedIn ? "Signed in" : "Preview"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border-[3px] border-black bg-white p-3 shadow-[5px_5px_0_0_#111]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
            Mode
          </p>
          <p className="mt-2 text-sm font-black text-ink">
            {authState?.required ? "Locked" : "Optional"}
          </p>
        </div>
        <div className="rounded-[20px] border-[3px] border-black bg-white p-3 shadow-[5px_5px_0_0_#111]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
            Session
          </p>
          <p className="mt-2 text-sm font-black text-ink">
            {signedIn ? authState.session.name : "Not signed in"}
          </p>
        </div>
        <div className="rounded-[20px] border-[3px] border-black bg-white p-3 shadow-[5px_5px_0_0_#111]">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink-muted">
            Status
          </p>
          <p className="mt-2 text-sm font-black text-ink">
            {authState?.enabled ? "Cookie auth ready" : "Enable AUTH_SECRET"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border-[3px] border-black bg-white p-4 shadow-[6px_6px_0_0_#111]">
        {signedIn ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-black bg-[#2f6bff] text-white shadow-[5px_5px_0_0_#111]">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-ink">{authState.session.name}</p>
                <p className="text-xs font-semibold text-ink-soft">{authState.session.email || "No email saved"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#f7f2e8] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_0_#111]"
              >
                Refresh session
              </button>
              <button
                type="button"
                onClick={onLogout}
                disabled={authBusy}
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#ff9fb0] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_0_#111] disabled:opacity-70"
              >
                {authBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Name"
                value={authForm.name}
                onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Aarav Shah"
                autoComplete="name"
              />
              <Field
                label="Email"
                value={authForm.email}
                onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@org.org"
                type="email"
                autoComplete="email"
              />
            </div>
            <Field
              label="Invite code"
              value={authForm.code}
              onChange={(event) => setAuthForm((current) => ({ ...current, code: event.target.value }))}
              placeholder="Optional if not required"
              autoComplete="off"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={authBusy || !authState?.enabled}
                className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#2f6bff] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[4px_4px_0_0_#111] disabled:opacity-70"
              >
                {authBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Create session
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border-[3px] border-black bg-[#a7f3d0] px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-ink shadow-[4px_4px_0_0_#111]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Invite code optional unless required
              </span>
            </div>
          </form>
        )}

        {authMessage ? (
          <p className="mt-3 rounded-[18px] border-[3px] border-black bg-[#ffe98a] px-3 py-2 text-sm font-semibold text-ink shadow-[4px_4px_0_0_#111]">
            {authMessage}
          </p>
        ) : null}

        {!authState?.enabled ? (
          <p className="mt-3 text-xs leading-5 text-ink-soft">
            Set <span className="font-black">AUTH_SECRET</span> in Cloud Run or Secret Manager to turn this into a signed-session experience.
          </p>
        ) : null}
      </div>
    </motion.article>
  );
}
