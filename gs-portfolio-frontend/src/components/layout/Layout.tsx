import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Header } from "./Header"
import { Footer } from "./Footer"

export interface LayoutProps {
  children: ReactNode
  className?: string
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
} 