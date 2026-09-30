"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/LoginForm"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function LoginPage() {
  const router = useRouter()

  function handleLoginSuccess() {
    router.push("/dashboard")
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}
