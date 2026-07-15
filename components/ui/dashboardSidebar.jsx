"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
    AlertTriangle,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Settings,
    ShoppingCart,
    Store,
    Tag,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

const sections = [
    {
        label: "العام",
        items: [
            { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
            { href: "/dashboard/products", label: "المنتجات", icon: Package },
        ],
    },
    {
        label: "المبيعات",
        items: [
            { href: "/dashboard/pos", label: "نقطة البيع", icon: ShoppingCart },
        ],
    },
    {
        label: "المخزن",
        items: [
            { href: "/dashboard/low-stock", label: "النواقص", icon: AlertTriangle },
            { href: "/dashboard/categories", label: "التصنيفات", icon: Tag },
        ],
    },
]

function isActive(href, pathname) {
    if (href === "/dashboard") return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
}

function NavItem({ href, label, icon: Icon, active, onSelect }) {
    return (
        <Link
            href={href}
            onClick={onSelect}
            aria-current={active ? "page" : undefined}
            className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
        </Link>
    )
}

function SidebarBody({ user, loading, pathname, onSelect, onLogout, loggingOut }) {
    const storeName = user?.store_name || "متجري"
    const initial = storeName.trim().charAt(0) || "م"

    return (
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
                <Avatar className="size-10 rounded-md">
                    <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                        {loading ? <Store className="h-5 w-5" /> : initial}
                    </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                    <span className="text-xs text-sidebar-foreground/60">المتجر</span>
                    {loading ? (
                        <Skeleton className="h-4 w-24" />
                    ) : (
                        <span className="truncate font-bold">{storeName}</span>
                    )}
                </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto p-3">
                {sections.map(section => (
                    <div key={section.label} className="space-y-1">
                        <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
                            {section.label}
                        </p>
                        {section.items.map(item => (
                            <NavItem
                                key={item.href}
                                {...item}
                                active={isActive(item.href, pathname)}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            <div className="space-y-1 border-t border-sidebar-border p-3">
                <NavItem
                    href="/dashboard/settings"
                    label="الإعدادات"
                    icon={Settings}
                    active={isActive("/dashboard/settings", pathname)}
                    onSelect={onSelect}
                />
                <button
                    type="button"
                    onClick={onLogout}
                    disabled={loggingOut}
                    className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors",
                        "hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                    )}
                >
                    {loggingOut ? (
                        <Spinner className="h-4 w-4" />
                    ) : (
                        <LogOut className="h-4 w-4" />
                    )}
                    {loggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
                </button>
            </div>
        </div>
    )
}

export default function DashboardSidebar() {
    const { user, loading } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } finally {
            setOpen(false)
            setLoggingOut(false)
            router.refresh()
            router.push("/authentication")
        }
    }

    return (
        <>
            <div
                dir="rtl"
                className="flex items-center gap-2 border-b border-border bg-background p-2 lg:hidden"
            >
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="فتح القائمة">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        dir="rtl"
                        showCloseButton={false}
                        className="w-72 bg-sidebar p-0 text-sidebar-foreground lg:max-w-xs"
                    >
                        <SheetTitle className="sr-only">قائمة لوحة التحكم</SheetTitle>
                        <SidebarBody
                            user={user}
                            loading={loading}
                            pathname={pathname}
                            onSelect={() => setOpen(false)}
                            onLogout={handleLogout}
                            loggingOut={loggingOut}
                        />
                    </SheetContent>
                </Sheet>
                <div className="flex min-w-0 items-center gap-2">
                    <Store className="h-4 w-4 text-foreground/70" />
                    {loading ? (
                        <Skeleton className="h-4 w-20" />
                    ) : (
                        <span className="truncate text-sm font-bold">
                            {user?.store_name || "متجري"}
                        </span>
                    )}
                </div>
            </div>

            <aside
                dir="rtl"
                className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 border-l border-sidebar-border bg-sidebar lg:block"
            >
                <SidebarBody
                    user={user}
                    loading={loading}
                    pathname={pathname}
                    onLogout={handleLogout}
                    loggingOut={loggingOut}
                />
            </aside>
        </>
    )
}
