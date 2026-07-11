import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Compass, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import {supabase} from "../../lib/supabaseClient";
/* ─── shared constants ─── */
const COLORS = {
  forest: "#0F5132",
  forestSoft: "#0c3f27",
  mint: "#34D399",
  cream: "#F9FAFB",
  border: "#E5E7EB",
  ink: "#111827",
  muted: "#6B7280",
  red: "#EF4444",
  redSoft: "#FEF2F2",
  card: "#FFFFFF",
};

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "#EF4444", "#F59E0B", "#B8913A", "#0F5132"];

/* ─── Logo ─── */
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: COLORS.mint }}>
        <Compass size={20} color={COLORS.forest} />
      </div>
      <span className="text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: COLORS.forest }}>
        DER LENG
      </span>
    </div>
  );
}

/* ─── Field ─── */
function Field({ label, type = "text", icon: Icon, placeholder, value, onChange, error, right }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1.5" style={{ color: COLORS.ink }}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
          <Icon size={15} color={error ? COLORS.red : COLORS.muted} />
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-10 py-3 rounded-xl border text-sm outline-none transition-colors"
          style={{
            background: error ? COLORS.redSoft : COLORS.card,
            borderColor: error ? COLORS.red : value ? COLORS.forest : COLORS.border,
            color: COLORS.ink,
          }}
        />
        {right && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</span>
        )}
      </div>
      {error && (
        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: COLORS.red }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Social button ─── */
function SocialBtn({ icon, label }) {
  return (
    <button
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-50"
      style={{ borderColor: COLORS.border, color: COLORS.ink, background: COLORS.card }}
    >
      <span>{icon}</span> {label}
    </button>
  );
}

/* ─── Password strength ─── */
function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

/* ─── Validation ─── */
function validate({ name, username, email, password, confirm }) {
  const e = {};

  if (!name.trim()) e.name = "Full name is required";

  if (!username.trim()) {
    e.username = "Username is required";
  } else if (username.length < 3) {
    e.username = "Username must be at least 3 characters";
  }

  if (!email) e.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email))
    e.email = "Enter a valid email";

  if (!password) e.password = "Password is required";
  else if (password.length < 8)
    e.password = "At least 8 characters";

  if (!confirm)
    e.confirm = "Please confirm your password";
  else if (confirm !== password)
    e.confirm = "Passwords don't match";

  return e;
}
/* ═══════════════════════════════
   REGISTER PAGE
═══════════════════════════════ */
// Props:
//   onSuccess — called after account created (navigate to home or login)
//   onLogin   — called when user clicks "Sign in" (navigate to login)
export default function RegisterPage({ onSuccess, onLogin }) {
  const [form, setForm] = useState({ name: "",username:"", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const pw = form.password;
  const score = strengthScore(pw);

  const submit = async () => {
  const validationErrors = validate(form);

  if (!agreed) {
    validationErrors.terms =
      "You must accept the terms to continue";
  }

  setErrors(validationErrors);
  setServerError("");

  if (Object.keys(validationErrors).length > 0) {
    return;
  }

  setLoading(true);

  const username = form.username
    .trim()
    .toLowerCase();

  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        data: {
          full_name: form.name.trim(),
          username,
        },
      },
    });

    if (error) {
      console.error("Signup message:", error.message);
      console.error("Signup code:", error.code);
      console.error("Signup status:", error.status);

      setServerError(
        typeof error.message === "string" &&
          error.message.length > 0
          ? error.message
          : "Unable to create the account."
      );

      return;
    }

    if (!data?.user) {
      setServerError(
        "Supabase did not create the account."
      );
      return;
    }

    setSuccess(true);
    onSuccess?.(data.user);
  } catch (error) {
    console.error("Unexpected signup error:", error);

    setServerError(
      error instanceof Error
        ? error.message
        : "Could not connect to Supabase."
    );
  } finally {
    setLoading(false);
  }
};

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: COLORS.cream }}>
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: COLORS.mint }}
          >
            <Check size={28} color={COLORS.forest} />
          </div>
          <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Account created!
          </h2>
          <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
            Welcome to Der Leng,{" "}
            <strong style={{ color: COLORS.ink }}>{form.name.split(" ")[0]}</strong>.
            We're setting up your profile now.
          </p>
          <button
            onClick={onLogin}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: COLORS.forest }}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  /* ── Main layout ── */
  return (
    <div className="min-h-screen flex" style={{ background: COLORS.cream }}>

      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: COLORS.forest }}
      >
        {/* blobs */}
        <div className="absolute rounded-full opacity-10" style={{ width: 480, height: 480, top: -180, right: -120, background: COLORS.mint }} />
        <div className="absolute rounded-full opacity-10" style={{ width: 260, height: 260, bottom: -80, left: -60, background: COLORS.mint }} />

        <div className="relative z-10"><Logo /></div>

        <div className="relative z-10">
          <h2
            className="text-4xl font-semibold text-white leading-snug mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The Kingdom of Wonder awaits your crew
          </h2>
          <p className="text-sm mb-8" style={{ color: "#C9DACE" }}>
            Join 12,000+ travel squads already planning across Cambodia together.
          </p>

          {/* feature checklist */}
          {[
            "Build shared itineraries with your group",
            "Save & vote on destinations together",
            "Chat with your squad in one place",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 mb-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(52,211,153,0.2)" }}
              >
                <Check size={11} color={COLORS.mint} />
              </div>
              <span className="text-sm" style={{ color: "#C9DACE" }}>{f}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 Der Leng. All rights reserved.
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* logo — mobile only */}
          <div className="lg:hidden mb-8"><Logo /></div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Already have one?{" "}
              <button
                onClick={onLogin}
                className="font-semibold underline"
                style={{ color: COLORS.forest }}
              >
                Sign in
              </button>
            </p>
          </div>

          {/* social buttons */}

          {/* divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: COLORS.border }} />
            <div className="flex-1 h-px" style={{ background: COLORS.border }} />
          </div>

          {/* fields */}
          <div className="space-y-4 mb-4">
            <Field
              label="Full name"
              icon={User}
              placeholder="Sophea Vann"
              value={form.name}
              onChange={set("name")}
              error={errors.name}
            />
            <Field
              label="username"
              icon={User}
              placeholder="hong009988"
              value={form.username}
              onChange={set("username")}
              error={errors.username}
            />
            <Field
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
            />
            <Field
              label="Password"
              type={showPw ? "text" : "password"}
              icon={Lock}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              right={
                <button type="button" onClick={() => setShowPw((s) => !s)} className="text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* password strength bar */}
            {pw.length > 0 && (
              <div>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="flex-1 h-1.5 rounded-full transition-all"
                      style={{ background: score >= n ? STRENGTH_COLOR[score] : COLORS.border }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: STRENGTH_COLOR[score] }}>
                  {STRENGTH_LABEL[score]}
                </p>
              </div>
            )}

            <Field
              label="Confirm password"
              type={showConfirm ? "text" : "password"}
              icon={Lock}
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={set("confirm")}
              error={errors.confirm}
              right={
                <button type="button"  onClick={() => setShowConfirm((s) => !s)} className="text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </div>

          {/* terms checkbox */}
          <label className="flex items-start gap-2.5 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#0F5132]"
            />
            <span className="text-xs" style={{ color: COLORS.muted }}>
              I agree to Der Leng's{" "}
              <span className="underline font-semibold" style={{ color: COLORS.forest }}>
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline font-semibold" style={{ color: COLORS.forest }}>
                Privacy Policy
              </span>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs mb-4 flex items-center gap-1" style={{ color: COLORS.red }}>
              <AlertCircle size={11} /> {errors.terms}
            </p>
          )}
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-300 text-red-600 text-sm">
              {serverError}
            </div>
          )}
          {/* submit */}
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: COLORS.forest }}
          >
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : <><span>Create account</span><ArrowRight size={15} /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}