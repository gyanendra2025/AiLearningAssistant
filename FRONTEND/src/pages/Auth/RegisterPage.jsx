import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../Service/authService";
import { toast } from "react-hot-toast";
import { BrainCircuit, Mail, Lock, ArrowRight, Eye, EyeOff, User } from "lucide-react";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authService.register(username, email, password);
      toast.success("Account created successfully! Please login.");
      navigate("/login");
    } catch (error) {
      setError(error.message || "Registration failed");
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputWrapperClass = (field) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-300 bg-white/70 ${
      focusedField === field
        ? "border-indigo-400 shadow-lg shadow-indigo-100/50 ring-4 ring-indigo-50"
        : "border-gray-200 hover:border-gray-300"
    }`;

  const iconClass = (field) =>
    `w-5 h-5 transition-colors duration-300 flex-shrink-0 ${
      focusedField === field ? "text-indigo-500" : "text-gray-400"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-100 px-4 py-8">
      {/* Decorative blurred blobs */}
      <div className="fixed top-[-120px] right-[-120px] w-[400px] h-[400px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-150px] left-[-100px] w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/60 p-8 sm:p-10 transition-all duration-500"
          style={{ animation: "fadeInUp 0.6s ease-out" }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-300/50 transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <BrainCircuit className="w-8 h-8 text-white" strokeWidth={1.8} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Create account
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Start your learning journey today
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className={inputWrapperClass("username")}>
                <User className={iconClass("username")} strokeWidth={1.8} />
                <input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="johndoe"
                  required
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className={inputWrapperClass("email")}>
                <Mail className={iconClass("email")} strokeWidth={1.8} />
                <input
                  id="register-email"
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
              <div className={inputWrapperClass("password")}>
                <Lock className={iconClass("password")} strokeWidth={1.8} />
                <input
                  id="register-password"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className={inputWrapperClass("confirmPassword")}>
                <Lock className={iconClass("confirmPassword")} strokeWidth={1.8} />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-indigo-500 transition-colors duration-200 flex-shrink-0 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.8} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 active:scale-[0.98] mt-2"
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
                  <span>Creating account...</span>
                </div>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-500 font-semibold hover:text-indigo-600 transition-colors duration-200 underline underline-offset-2 decoration-indigo-200 hover:decoration-indigo-400"
            >
              Sign in
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

export default RegisterPage;