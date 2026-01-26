import { Outlet } from "react-router-dom";
import { CurrencyProvider } from "@/lib/finance/CurrencyContext";
import SettingsLayout from "./layout";

export default function SettingsLayoutWrapper() {
  return (
    <CurrencyProvider>
      <SettingsLayout>
        <Outlet />
      </SettingsLayout>
    </CurrencyProvider>
  );
}
