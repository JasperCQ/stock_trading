import { LoginPanel } from "@/components/LoginPanel";
import { StockDashboard } from "@/components/StockDashboard";
import { isAuthenticated } from "@/lib/auth";

export default async function Home() {
  if (!(await isAuthenticated())) {
    return <LoginPanel />;
  }

  return <StockDashboard />;
}
