import { Outlet } from "react-router-dom";
import StockSettingsLayout from "./layout";

export default function StockSettingsLayoutWrapper() {
  return (
    
      <div className="p-4 md:p-8">
        <StockSettingsLayout>
          <Outlet />
        </StockSettingsLayout>
      </div>
    
  );
}
