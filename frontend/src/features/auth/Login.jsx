import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Compass, ArrowRight, Check, AlertCircle, Loader2 } from "lucide-react";
import {supabase} from "../../lib/supabaseClient";
import{useNavigate} from "react-router-dom";
import {
  ADMIN_ROLES,
  normalizeRole,
} from "../../constants/roles";
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

/* ─── Validation ─── */
function validate({ email, password }) {
  const e = {};
  if (!email) e.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
  if (!password) e.password = "Password is required";
  else if (password.length < 6) e.password = "At least 6 characters";
  return e;
}

/* ═══════════════════════════════
   LOGIN PAGE
═══════════════════════════════ */
// Props:
//   onSuccess  — called after successful login (navigate to home)
//   onRegister — called when user clicks "Sign up" (navigate to register)
export default function LoginPage({ onSuccess, onRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate= useNavigate();
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (event) => {
    event?.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 1. Check email and password
      const {
        data: authData,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (loginError) {
        setErrors({
          email: "Incorrect email or password.",
        });
        return;
      }

      const loggedInUser = authData.user;

      if (!loggedInUser) {
        setErrors({
          email: "Login failed. Please try again.",
        });
        return;
      }

      // 2. Get the role from public.profiles
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          username,
          role
        `)
        .eq("id", loggedInUser.id)
        .single();

      if (profileError || !profile) {
        console.error(
          "Profile role error:",
          profileError
        );

        await supabase.auth.signOut();
        setErrors({
          email:
            "Your profile could not be loaded.",
        });
        return;
      }

      const role = normalizeRole(profile.role);

      // 3. Show the success screen
      setSuccess(true);
      // 4. Redirect based on role
      setTimeout(() => {
        if (ADMIN_ROLES.includes(role)) {
          navigate("/admin/dashboard", {
            replace: true,
          });
        } else {
          navigate("/", {
            replace: true,
          });
        }
      }, 800);
    } catch (error) {
      console.error(
        "Unexpected login error:",
        error
      );
      setErrors({
        email:
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
};

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: COLORS.cream }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: COLORS.mint }}>
            <Check size={28} color={COLORS.forest} />
          </div>
          <h2 className="text-2xl font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome back!
          </h2>
            <p
            className="text-sm"
            style={{ color: COLORS.muted }}
          >
            Checking your account and redirecting...
          </p>
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
            Your next adventure is one login away
          </h2>
          <p className="text-sm mb-8" style={{ color: "#C9DACE" }}>
            Pick up where you left off — your squads, saved destinations, and itineraries are all waiting.
          </p>

          {/* mock trip card */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=80&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Angkor Wat"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Angkor Wat</div>
                <div className="text-xs" style={{ color: "#C9DACE" }}>Angkor Squad · Jul 18–20</div>
              </div>
            </div>
            <div className="flex -space-x-2">
              {[
                { label: "SR", bg: COLORS.mint },
                { label: "DA", bg: "#7A4FA0" },
                { label: "BO", bg: COLORS.forestSoft },
                { label: "VT", bg: "#B8913A" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold text-white"
                  style={{ borderColor: COLORS.forest, background: m.bg }}
                >
                  {m.label}
                </div>
              ))}
              <div
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold text-white"
                style={{ borderColor: COLORS.forest, background: "rgba(255,255,255,0.15)" }}
              >
                +2
              </div>
            </div>
          </div>
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
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-semibold underline"
                style={{ color: COLORS.forest }}
              >
                Sign up free
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
          <div className="space-y-4 mb-6">
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
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              right={
                <button type="button" onClick={() => setShowPw((s) => !s)} className="text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </div>

          {/* remember + forgot */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: COLORS.muted }}>
              <input type="checkbox" className="accent-[#0F5132]" />
              Remember me
            </label>
            <button className="text-xs font-semibold" style={{ color: COLORS.forest }}>
              Forgot password?
            </button>
          </div>

          {/* submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: COLORS.forest }}
          >
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : <><span>Sign in</span><ArrowRight size={15} /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}