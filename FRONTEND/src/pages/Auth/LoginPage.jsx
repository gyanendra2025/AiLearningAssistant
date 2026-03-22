import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../Service/authService";
import { toast } from "react-hot-toast";
import { BrainCircuit, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      login(response.token, response.user);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100 px-4 py-8">
      {/* Decorative blurred blobs */}
      <div className="fixed top-[-120px] left-[-120px] w-[400px] h-[400px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/60 p-8 sm:p-10 transition-all duration-500"
          style={{ animation: "fadeInUp 0.6s ease-out" }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-300/50 transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <BrainCircuit className="w-8 h-8 text-white" strokeWidth={1.8} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Sign in to continue your journey
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-300 bg-white/70 ${
                  focusedField === "email"
                    ? "border-indigo-400 shadow-lg shadow-indigo-100/50 ring-4 ring-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Mail
                  className={`w-5 h-5 transition-colors duration-300 flex-shrink-0 ${
                    focusedField === "email" ? "text-indigo-500" : "text-gray-400"
                  }`}
                  strokeWidth={1.8}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="alex@timetoprogram.com"
                  required
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-300 bg-white/70 ${
                  focusedField === "password"
                    ? "border-indigo-400 shadow-lg shadow-indigo-100/50 ring-4 ring-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Lock
                  className={`w-5 h-5 transition-colors duration-300 flex-shrink-0 ${
                    focusedField === "password" ? "text-indigo-500" : "text-gray-400"
                  }`}
                  strokeWidth={1.8}
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-indigo-500 transition-colors duration-200 flex-shrink-0 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.8} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-500 font-semibold hover:text-indigo-600 transition-colors duration-200 underline underline-offset-2 decoration-indigo-200 hover:decoration-indigo-400"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400/80 text-xs mt-6">
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-gray-500 transition-colors">
            Terms
          </span>{" "}
          &{" "}
          <span className="underline cursor-pointer hover:text-gray-500 transition-colors">
            Privacy Policy
          </span>
        </p>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
