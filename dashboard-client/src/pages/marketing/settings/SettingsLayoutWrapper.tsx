import { Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import MarketingSettingsLayout from "./layout";

export default function MarketingSettingsLayoutWrapper() {
  return (
    <Layout>
      <div className="p-4 md:p-8">
        <MarketingSettingsLayout>
          <Outlet />
        </MarketingSettingsLayout>
      </div>
    </Layout>
  );
}
