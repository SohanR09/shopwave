"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { ArrowUp } from "lucide-react"
export default function ScrollToTop() {
    const router = useRouter()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 100)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="fixed bottom-20 mb-2 right-10 z-50">
            {isVisible && (
                <Button className="bg-glacier-600 hover:bg-glacier-700 rounded-full text-white hover:text-white border-none" variant="outline" size="icon" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <ArrowUp className="w-4 h-4" />
                </Button>
            )}
        </div>
    )
}