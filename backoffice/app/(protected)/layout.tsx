import { AuthGuard } from "@/components/auth-guard";
import { Shell } from "@/components/shell";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Shell>{children}</Shell>
    </AuthGuard>
  );
}
