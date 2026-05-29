import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/register", form);
      login(res.data.token, res.data.user);
      alert("Registration successful");
      navigate("/");
    } catch (err) {
      console.log(err);
      const message =
        err.response?.data?.error || "Registration failed. Please try again.";
      setError(message);
      alert(message);
    }
  };

  return (
    <main className="page-wrap flex min-h-[calc(100vh-88px)] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="panel w-full max-w-md rounded-2xl p-8"
      >
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#9c5f33]">
          Join StoryBrew
        </p>
        <h1 className="text-3xl font-black tracking-tight text-[#2b1710]">
          Register
        </h1>
        <p className="muted-text mt-2 mb-6">
          Create your profile and start sharing your own posts.
        </p>

        <input
          type="text"
          placeholder="Name"
          className="field mb-3 w-full rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="field mb-3 w-full rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="field mb-5 w-full rounded-xl px-4 py-3"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && (
          <p className="mb-4 rounded-xl border border-[#9f2f21]/20 bg-[#fff1ed] px-4 py-3 text-sm font-bold text-[#9f2f21]">
            {error}
          </p>
        )}

        <button className="brown-button w-full rounded-xl p-3 font-bold">
          Register
        </button>

        <p className="muted-text mt-5 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#7a4826]">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}

export default Register;
