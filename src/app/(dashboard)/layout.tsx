import Link from "next/link";
import { LayoutDashboard, Globe, Users, MessageSquare, Briefcase, Activity, Bug, Bell, FileText } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-200 h-16 flex items-center">
          <h1 className="text-xl font-bold tracking-tight text-blue-600">Veroliq Backoffice</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <LayoutDashboard className="w-5 h-5 text-gray-400" /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/sites" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <Globe className="w-5 h-5 text-gray-400" /> Sites
              </Link>
            </li>
            <li>
              <Link href="/sessions" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <Users className="w-5 h-5 text-gray-400" /> Sessions
              </Link>
            </li>
            <li>
              <Link href="/messages" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <MessageSquare className="w-5 h-5 text-gray-400" /> Messages
              </Link>
            </li>
            <li>
              <Link href="/leads" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <Briefcase className="w-5 h-5 text-gray-400" /> Leads
              </Link>
            </li>
            <li>
              <Link href="/crawls" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <Bug className="w-5 h-5 text-gray-400" /> Crawls
              </Link>
            </li>
            <li>
              <Link href="/events" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <Activity className="w-5 h-5 text-gray-400" /> Widget Events
              </Link>
            </li>
            <li className="pt-3">
              <span className="px-3 text-[11px] uppercase tracking-wider text-gray-400">Notifications</span>
            </li>
            <li>
              <Link href="/notifications" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-400" /> Monitoring
              </Link>
            </li>
            <li>
              <Link href="/notifications/templates" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
                <FileText className="w-5 h-5 text-gray-400" /> Templates
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-3 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6 md:hidden">
           <h1 className="text-xl font-bold tracking-tight text-blue-600">Veroliq Backoffice</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}
