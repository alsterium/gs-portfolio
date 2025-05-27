import { cn } from "@/lib/utils"

export interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "bg-gradient-to-r from-gs-primary/10 via-white to-gs-secondary/10",
      "border-b border-gs-neutral-200/50 backdrop-blur-sm",
      "shadow-sm shadow-gs-primary/5",
      "transition-all duration-300",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className={cn(
              "text-xl font-bold bg-gradient-to-r from-gs-primary to-gs-secondary",
              "bg-clip-text text-transparent",
              "transition-all duration-300 hover:scale-105",
              "cursor-default"
            )}>
              GS Portfolio
            </h1>
          </div>
          
          <nav role="navigation" className="flex items-center space-x-4">
            <a 
              href="/" 
              className={cn(
                "text-sm font-medium text-gs-neutral-700",
                "transition-all duration-200",
                "hover:text-gs-primary hover:scale-105",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-primary focus-visible:ring-offset-2",
                "px-3 py-2 rounded-md"
              )}
            >
              Home
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
} 