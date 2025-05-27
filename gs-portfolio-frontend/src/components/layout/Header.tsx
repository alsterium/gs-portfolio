import { cn } from "@/lib/utils"

export interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "border-b border-gs-neutral-200 bg-white shadow-sm",
      "transition-shadow duration-200",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gs-primary transition-colors hover:text-gs-secondary">
              GS Portfolio
            </h1>
          </div>
          
          <nav role="navigation" className="flex items-center space-x-4">
            <a 
              href="/" 
              className="text-sm font-medium text-gs-neutral-700 transition-colors hover:text-gs-primary"
            >
              Home
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
} 