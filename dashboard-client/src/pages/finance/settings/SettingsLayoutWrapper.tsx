import { Outlet } from "react-router-dom";
import { CurrencyProvider } from "@/lib/finance/CurrencyContext";
import { Layout } from "@/components/Layout";
import SettingsLayout from "./layout";

export default function SettingsLayoutWrapper() {
  return (
    <CurrencyProvider>
      <Layout>
        <div className="p-4 md:p-8">
          <SettingsLayout>
            <Outlet />
          </SettingsLayout>
        </div>
      </Layout>
    </CurrencyProvider>
  );
}
