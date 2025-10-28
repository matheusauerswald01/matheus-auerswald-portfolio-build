import { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import PortalHeader from "./PortalHeader";
import PortalSidebar from "./PortalSidebar";
import { ProtectedRoute } from "@/contexts/PortalAuthContext";

interface PortalLayoutProps {
  children: ReactNode;
  requiredRole?: "client" | "admin";
}

export default function PortalLayout({
  children,
  requiredRole,
}: PortalLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <PortalHeader
          onMenuClick={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex">
          {/* Sidebar */}
          <PortalSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

          {/* Main Content */}
          <motion.main
            className="flex-1 lg:ml-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container max-w-7xl mx-auto p-4 lg:p-6">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
