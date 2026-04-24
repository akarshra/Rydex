"use client";

"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "@/redux/userSlice";
import { BACKEND_URL } from "@/lib/backend";
import { signIn } from "next-auth/react";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Step = "login" | "signup" | "otp";

export default function AuthModal({ open, onClose }: Props) {
  const dispatch = useDispatch();
  const [step, setStep] = useState<Step>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleLogin = async () => {
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        alert("Invalid email or password");
      } else {
        onClose();
        window.location.reload();
      }
    } catch {
      alert("Invalid email or password");
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`/api/auth/register`, {
        name,
        email,
        password,
      });
      setStep("otp");
    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post(`/api/auth/verify-otp`, {
        email,
        otp: otp.join(""),
      });
      await handleLogin();
    } catch (error: any) {
      alert(error.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0b0f17]/95 p-6 text-white shadow-[0_40px_100px_rgba(0,0,0,0.5)] sm:p-8">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-white/50 transition hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="mb-6 text-center">
                <h1 className="text-3xl font-extrabold tracking-[0.35em] text-white">
                  RYDEX
                </h1>
                <p className="mt-1 text-xs text-white/50">
                  Premium Vehicle Booking
                </p>
              </div>

              <button
                onClick={handleLogin}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
              >
                <Image src="/google.png" alt="Login" width={20} height={20} />
                Continue with Email
              </button>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/45">OR</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <AnimatePresence mode="wait">
                {step === "login" && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-xl font-semibold text-white">Welcome back</h2>

                    <div className="mt-5 space-y-4">
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <Mail size={18} className="text-white/45" />
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
                        />
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <Lock size={18} className="text-white/45" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-white/45 transition hover:text-white"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <button
                        onClick={handleLogin}
                        className="h-11 w-full rounded-xl bg-white text-black font-semibold transition hover:bg-white/90"
                      >
                        Login
                      </button>
                    </div>

                    <p className="mt-6 text-center text-sm text-white/50">
                      Don’t have an account?{" "}
                      <button
                        onClick={() => setStep("signup")}
                        className="font-medium text-white hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </motion.div>
                )}

                {step === "signup" && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-xl font-semibold text-white">Create account</h2>

                    <div className="mt-5 space-y-4">
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <User size={18} className="text-white/45" />
                        <input
                          placeholder="Full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
                        />
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <Mail size={18} className="text-white/45" />
                        <input
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
                        />
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <Lock size={18} className="text-white/45" />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
                        />
                      </div>

                      <button
                        onClick={handleRegister}
                        className="h-11 w-full rounded-xl bg-white text-black font-semibold transition hover:bg-white/90"
                      >
                        Send OTP
                      </button>
                    </div>

                    <p className="mt-6 text-center text-sm text-white/50">
                      Already have an account?{" "}
                      <button
                        onClick={() => setStep("login")}
                        className="font-medium text-white hover:underline"
                      >
                        Login
                      </button>
                    </p>
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-xl font-semibold text-white">Verify Email</h2>

                    <div className="mt-6 flex justify-between gap-2">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          className="h-12 w-10 rounded-xl border border-white/10 bg-white/5 text-center text-lg font-semibold text-white outline-none placeholder:text-white/35 sm:w-12"
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      className="mt-6 h-11 w-full rounded-xl bg-white text-black font-semibold transition hover:bg-white/90"
                    >
                      Verify & Create Account
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
