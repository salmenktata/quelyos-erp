import { Outlet } from "react-router-dom";
import CrmSettingsLayout from "./layout";

export default function CrmSettingsLayoutWrapper() {
  return (
    
      <div className="p-4 md:p-8">
        <CrmSettingsLayout>
          <Outlet />
        </CrmSettingsLayout>
      </div>
    
  );
}
