import { Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import StockSettingsLayout from "./layout";

export default function StockSettingsLayoutWrapper() {
  return (
    <Layout>
      <div className="p-4 md:p-8">
        <StockSettingsLayout>
          <Outlet />
        </StockSettingsLayout>
      </div>
    </Layout>
  );
}
