import { ReactNode } from "react";
import Tabbar from "./Tabbar";

interface LayoutProps {
  children: ReactNode;
  hideTabbar?: boolean;
}

export default function Layout({ children, hideTabbar = false }: LayoutProps) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      {!hideTabbar && <Tabbar />}
    </div>
  );
}
