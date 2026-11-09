import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { DemoStoreProvider } from "@/components/admin/demo-store";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DemoStoreProvider><div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 lg:px-8 lg:py-6">{children}</div>
      </main>
    </div></DemoStoreProvider>
  );
}
