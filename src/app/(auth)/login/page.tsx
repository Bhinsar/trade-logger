"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-950 p-4 selection:bg-emerald-500/30">
      {/* Animated background elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-blob rounded-full bg-emerald-500/20 opacity-50 mix-blend-screen blur-[100px] filter" />
        <div className="absolute h-[500px] w-[500px] translate-x-1/3 translate-y-1/3 animate-blob animation-delay-2000 rounded-full bg-teal-500/20 opacity-50 mix-blend-screen blur-[100px] filter" />
        <div className="absolute h-[500px] w-[500px] -translate-x-1/3 translate-y-1/2 animate-blob animation-delay-4000 rounded-full bg-blue-500/20 opacity-50 mix-blend-screen blur-[100px] filter" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Glassmorphism Card */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/50 p-8 shadow-2xl backdrop-blur-2xl transition-all">
          <div className="mb-8 space-y-3 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-400">
              Enter your credentials to access your trade diary
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="group cursor-pointer relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-900 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all hover:bg-zinc-100 hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] active:scale-[0.98]"
            >
              <div className="absolute left-4 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
              </div>
              Continue with Google
            </button>

            {/* <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="mx-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div> */}

            {/* <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 active:scale-[0.98]"
              >
                Sign In
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form> */}
          </div>

          {/* <div className="mt-8 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-white hover:text-emerald-400 transition-colors">
              Sign up
            </Link>
          </div> */}
        </div>
      </div>

    </div>
  );
}
