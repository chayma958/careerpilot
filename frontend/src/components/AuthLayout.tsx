import type { ReactNode } from "react";
import { LogoMark } from "./LogoMark";
import { AuthHeroArt } from "./AuthHeroArt";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="relative hidden w-1/2 flex-col overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-gray-900 p-16 text-white lg:flex justify-between">
        <AuthHeroArt />

        <div className="relative flex items-center gap-2 font-brand text-2xl font-bold">
          <LogoMark className="h-7 w-7" />
          CareerPilot
        </div>

        <div className="relative mt-auto max-w-md pb-8">
          <p className="font-brand text-[2.75rem] leading-[1.15] font-semibold tracking-tight">
            Land your next role,
            <br />
            one application at a time.
          </p>
          <p className="mt-6 text-lg text-white/80 max-w-sm font-light">
            Track every application, tailor your resume with AI, and never miss a follow-up.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 font-brand text-lg font-semibold text-orange-500 lg:hidden dark:text-orange-400">
            <LogoMark />
            CareerPilot
          </div>
          <h1 className="mb-6 text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}