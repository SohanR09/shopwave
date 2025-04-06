"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const useScrollToTop = () => {
    const router = useRouter()

    useEffect(() => {
        window.scrollTo({ top: 0})
    }, [router])

    return null
}
