"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut, Menu, Store, User as UserIcon, X } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ModeToggle } from "@/components/ui/themeToggle"

const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/dashboard", label: "لوحة التحكم" },
    { href: "/settings", label: "الإعدادات" },
]

function getInitials(name) {
    if (!name) return "?"
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase()
}

export default function Navbar() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } finally {
            setMenuOpen(false)
            router.refresh()
            router.push("/authentication")
        }
    }
    console.log(user)

    return (
        <header
            dir="rtl"
            className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60"
        >
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                    <Store className="h-5 w-5 text-primary" />
                    <span>{user?.store_name || "متجري"}</span>
                </Link>

                <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="ms-auto flex items-center gap-2">
                    <ModeToggle />

                    {loading ? (
                        <Skeleton className="h-9 w-28 rounded-md" />
                    ) : user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2 ps-1.5">
                                    <Avatar size="sm">
                                        <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden max-w-32 truncate sm:inline">{user.name}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60 bg-background">
                                <DropdownMenuLabel className="font-normal">
                                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                    {user.store_name && (
                                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                            <Store className="h-3 w-3" />
                                            {user.store_name}
                                        </p>
                                    )}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="text-foreground">
                                        <UserIcon />
                                        الملف الشخصي
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                                    <LogOut />
                                    تسجيل الخروج
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild size="sm">
                            <Link href="/authentication">تسجيل الدخول</Link>
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(prev => !prev)}
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    "border-t border-border md:hidden",
                    menuOpen ? "block" : "hidden"
                )}
            >
                <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}