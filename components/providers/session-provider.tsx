"use client"

import type React from "react"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getSession } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchSession = async () => {
          setIsLoading(true)
            try {
                const {session, error} = await getSession()
                if (error) {
                    setError(error.message)
                } else {
                    setSession(session)
                }
            } catch (error) {
                setError("Failed to fetch session")
            } finally {
                setIsLoading(false)
            }
        }
        fetchSession()
    }, [])

    useEffect(() => {
      if (session) {
          router.push(pathname)
      }
    }, [error, session])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    )
  }
    
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}

