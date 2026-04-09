import { AuthGuard } from "@/components/auth-guard";
import { AdminShellProvider } from "@/components/admin-shell-provider";
import { Shell } from "@/components/shell";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminShellProvider>
        <Shell>{children}</Shell>
      </AdminShellProvider>
    </AuthGuard>
  );
}
