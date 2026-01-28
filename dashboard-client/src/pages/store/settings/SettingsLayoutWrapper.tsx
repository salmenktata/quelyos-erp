import { Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import StoreSettingsLayout from "./layout";

export default function StoreSettingsLayoutWrapper() {
  return (
    <Layout>
      <div className="p-4 md:p-8">
        <StoreSettingsLayout>
          <Outlet />
        </StoreSettingsLayout>
      </div>
    </Layout>
  );
}
