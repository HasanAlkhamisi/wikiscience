"use client"

import { useRouter } from "next/navigation"
import RegisterForm from "@/components/RegisterForm"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-sm md:max-w-4xl">
        <RegisterForm onSuccess={() => router.push("/dashboard")} />
      </div>
    </div>
  )
}
