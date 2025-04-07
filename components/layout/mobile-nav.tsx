"use client"


import { useIsMobile } from "@/hooks/use-mobile";
import { CircleUser, Heart, Home, Settings, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function MobileNavMenu() {
    const isMobileView = useIsMobile()
    const pathname = usePathname()

    if (pathname.includes("/signin") || pathname.includes("/signup")) {
        return null
    }

    return (
        <React.Fragment>
            {
                isMobileView && (
                    <footer className="h-20 z-50 sticky bottom-0 left-0 bg-white border border-glacier-200 border-t-2 shadow-lg">
                        <nav className="flex justify-around items-center h-full">
                            <Link href="/">
                                <div className="flex flex-col justify-center items-center">
                                    <Home />
                                    <span>Home</span>
                                </div>
                            </Link>
                            <Link href="/profile">
                                <div className="flex flex-col justify-center items-center">
                                    <CircleUser />
                                    <span>Profile</span>
                                </div>

                            </Link>
                            <Link href="/settings">
                                <div className="flex flex-col justify-center items-center">
                                    <Settings />
                                    <span>Settings</span>
                                </div>
                            </Link>
                            <Link href="/cart">
                                <div className="flex flex-col justify-center items-center">
                                    <ShoppingCart />
                                    <span>Cart</span>
                                </div>
                            </Link>
                        </nav>
                    </footer>
                )
            }
        </React.Fragment>
    )
}