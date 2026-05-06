import {
  BarChart2,
  BookOpen,
  CircleDollarSign,
  LayoutDashboard,
  LineChart,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  href?: string;
}

// interface NavSection {
//   title: string;
//   items: NavItem[];
// }

export const navSections: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    href: "/dashboard",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: <Wallet size={18} />,
  },
  {
    id: "trades",
    label: "Trades",
    icon: <TrendingUp size={18} />,
  },
  {
    id: "positions",
    label: "Positions",
    icon: <Target size={18} />,
  },
  {
    id: "orders",
    label: "Orders",
    icon: <CircleDollarSign size={18} />,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart2 size={18} />,
  },
  {
    id: "performance",
    label: "Performance",
    icon: <LineChart size={18} />,
  },
  {
    id: "journal",
    label: "Journal",
    icon: <BookOpen size={18} />,
  },
];
