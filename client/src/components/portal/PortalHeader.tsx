import { motion } from "framer-motion";
import { LogOut, User, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePortalAuthContext } from "@/contexts/PortalAuthContext";
import { getInitials, getAvatarColor } from "@/lib/portalUtils";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

interface PortalHeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

export default function PortalHeader({
  onMenuClick,
  isSidebarOpen,
}: PortalHeaderProps) {
  const { user, signOut, isAdmin } = usePortalAuthContext();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/portal/login";
  };

  return (
    <motion.header
      className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Menu Button (Mobile) + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <motion.div
              animate={{ rotate: isSidebarOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.div>
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-sm">P</span>
            </motion.div>
            <span className="hidden sm:inline font-bold gradient-text">
              Portal do Cliente
            </span>
          </div>
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            loading={loading}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} alt={user?.email || "User"} />
                  <AvatarFallback
                    className={`${getAvatarColor(user?.email || "")} text-white`}
                  >
                    {getInitials(user?.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.email?.split("@")[0] || "Usuário"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.email?.split("@")[0] || "Usuário"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/30 w-fit mt-1">
                      Admin
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Navigate to profile
                  console.log("Profile");
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
