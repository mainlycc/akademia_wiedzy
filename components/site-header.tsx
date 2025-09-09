import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SignOutButton } from "@/components/signout-button"
import { Badge } from "@/components/ui/badge"

interface SiteHeaderProps {
  user?: {
    name: string
    email: string
    role?: string
  }
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex-1" />
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Zalogowano jako:</span>
            <span className="font-medium">{user.name}</span>
            {user.role && (
              <Badge variant="secondary" className="text-xs">
                {user.role}
              </Badge>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
