import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MessageCircle,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.error || "Login failed. Please check your details.";
      setError(message);
      console.log(err);
    }
  };

  return (
    <main className="auth-doodle-bg relative overflow-hidden">
      <div className="page-wrap relative z-10 grid min-h-[calc(100vh-88px)] items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#7a4826]/15 bg-[#2b1710] p-6 text-[#fff8ef] shadow-2xl shadow-[#522b18]/25 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(214,173,130,0.28),transparent_16rem),radial-gradient(circle_at_88%_18%,rgba(156,95,51,0.3),transparent_18rem),linear-gradient(135deg,rgba(255,248,239,0.08),transparent_45%)]" />

        <div className="relative">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-[#ead7c1] backdrop-blur-md">
            <Sparkles size={16} />
            A warm home for stories
          </div>

          <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-6xl">
            Write, save, discuss, and discover better posts.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#ead7c1]">
            StoryBrew brings your blog feed, comments, saved posts, and personal profile into one cozy writing space.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <PenLine className="mb-3 text-[#d6ad82]" size={22} />
              <p className="font-black">Publish</p>
              <p className="mt-1 text-sm text-[#d6ad82]">Share your ideas quickly.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <MessageCircle className="mb-3 text-[#d6ad82]" size={22} />
              <p className="font-black">Discuss</p>
              <p className="mt-1 text-sm text-[#d6ad82]">Keep conversations alive.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
              <BookOpen className="mb-3 text-[#d6ad82]" size={22} />
              <p className="font-black">Collect</p>
              <p className="mt-1 text-sm text-[#d6ad82]">Save posts for later.</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#d6ad82]">
              Inside your account
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#fff8ef] p-4 text-[#2b1710]">
                <PenLine className="mb-3 text-[#7a4826]" size={21} />
                <p className="font-black">Draft ideas</p>
                <p className="mt-1 text-sm text-[#7c5a44]">Create and edit your own posts.</p>
              </div>
              <div className="rounded-2xl bg-[#fff8ef] p-4 text-[#2b1710]">
                <MessageCircle className="mb-3 text-[#7a4826]" size={21} />
                <p className="font-black">Join threads</p>
                <p className="mt-1 text-sm text-[#7c5a44]">Reply to posts you care about.</p>
              </div>
              <div className="rounded-2xl bg-[#fff8ef] p-4 text-[#2b1710]">
                <BookOpen className="mb-3 text-[#7a4826]" size={21} />
                <p className="font-black">Save reads</p>
                <p className="mt-1 text-sm text-[#7c5a44]">Keep favorites in your profile.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#d6ad82]/20" />
        <div className="mb-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#ead7c1] px-3 py-1 text-sm font-bold text-[#704120]">
            <ShieldCheck size={15} />
            Secure sign in
          </p>
          <h2 className="text-4xl font-black tracking-tight text-[#2b1710]">
            Welcome back
          </h2>
          <p className="muted-text mt-3">
            Continue writing, saving, liking, and joining conversations.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-bold text-[#5a3018]">
            Email address
          </label>
          <div className="field mb-4 flex items-center gap-3 rounded-2xl px-4 py-1">
            <Mail size={19} className="text-[#9c5f33]" />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-transparent py-3 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <label className="mb-2 block text-sm font-bold text-[#5a3018]">
            Password
          </label>
          <div className="field mb-4 flex items-center gap-3 rounded-2xl px-4 py-1">
            <Lock size={19} className="text-[#9c5f33]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full bg-transparent py-3 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="rounded-full p-2 text-[#7a4826] hover:bg-[#f4e4d1]"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-2xl border border-[#9f2f21]/20 bg-[#fff1ed] px-4 py-3 text-sm font-bold text-[#9f2f21]">
              {error}
            </p>
          )}

          <button className="brown-button inline-flex w-full items-center justify-center gap-2 rounded-2xl p-4 text-base font-black">
            Sign in
            <ArrowRight size={19} />
          </button>
        </form>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#7a4826]/10 bg-[#fff8ef]/80 p-4">
            <p className="text-sm font-black text-[#5a3018]">Your profile</p>
            <p className="muted-text mt-1 text-sm">Posts and comments live in one place.</p>
          </div>
          <div className="rounded-2xl border border-[#7a4826]/10 bg-[#fff8ef]/80 p-4">
            <p className="text-sm font-black text-[#5a3018]">Reader tools</p>
            <p className="muted-text mt-1 text-sm">Like, save, comment, and share posts.</p>
          </div>
        </div>

        <p className="muted-text mt-6 text-center text-sm">
          New here?{" "}
          <Link to="/register" className="font-black text-[#7a4826] hover:text-[#3f2112]">
            Create an account
          </Link>
        </p>
      </section>
      </div>
    </main>
  );
}

export default Login;
