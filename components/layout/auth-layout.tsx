"use client"

import { getSession } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [session, setSession] = useState<any | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const {session, error} = await getSession()
                if (error) {
                    setError(error.message)
                } else {
                    setSession(session)
                }
            } catch (error) {
                setError("Failed to fetch session")
            }
        }
        fetchSession()
    }, [])

    if (!session) {
        router.push("/signin")
    }else if (session) {
        router.push("/")
    }else if (error) {
        router.push("/signin")
    }

    return <div>{children}</div>
}