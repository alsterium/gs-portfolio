import { cn } from "@/lib/utils"

export interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className={cn("border-t bg-background py-6", className)}>
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} GS Portfolio. All rights reserved.
        </p>
      </div>
    </footer>
  )
} 