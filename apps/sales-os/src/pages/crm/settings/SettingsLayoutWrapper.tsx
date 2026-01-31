import { Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import CrmSettingsLayout from "./layout";

export default function CrmSettingsLayoutWrapper() {
  return (
    <Layout>
      <div className="p-4 md:p-8">
        <CrmSettingsLayout>
          <Outlet />
        </CrmSettingsLayout>
      </div>
    </Layout>
  );
}
