import { cn } from "@/lib/utils"

export interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("border-b bg-background", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">GS Portfolio</h1>
          </div>
          
          <nav role="navigation" className="flex items-center space-x-4">
            <a 
              href="/" 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
} 