
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { User } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserAvatarProps {
  user: SupabaseUser
}

export const UserAvatar = ({ user }: UserAvatarProps) => {
  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user.email ? getInitials(user.email) : <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <p>{user.email}</p>
      </TooltipContent>
    </Tooltip>
  )
}
