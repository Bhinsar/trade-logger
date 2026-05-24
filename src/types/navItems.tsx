import {
  Calendar,
  LayoutDashboard,
  Lightbulb,
  Monitor,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { IoWarningOutline } from "react-icons/io5";
import { TbChecklist } from "react-icons/tb";

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
    id: "tradeschecklist",
    label: "Trade Checklist",
    icon: <TbChecklist size={18} />,
    href: "/trades-checklist",
  },
  {
    id: "rules",
    label: "Rules",
    icon: <ShieldCheck size={18} />,
    href: "/rules",
  },
  {
    id: "trades",
    label: "Trades",
    icon: <TrendingUp size={18} />,
    href: "/trades",
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: <Lightbulb size={18} />,
    href: "/strategy",
  },
  {
    id: "mistakes",
    label: "Mistakes",
    icon: <IoWarningOutline size={18} />,
    href: "/mistakes",
  },
  {
    id: "aiSummary",
    label: "AI Summary",
    icon: <Monitor  size={18} />,
    href: "/ai-summary",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: <Calendar size={18} />,
    href: "/calendar",
  },
   // {
  //   id: "portfolio",
  //   label: "Portfolio",
  //   icon: <Wallet size={18} />,
  // },
  // {
  //   id: "positions",
  //   label: "Positions",
  //   icon: <Target size={18} />,
  // },
  // {
  //   id: "orders",
  //   label: "Orders",
  //   icon: <CircleDollarSign size={18} />,
  // },
  // {
  //   id: "analytics",
  //   label: "Analytics",
  //   icon: <BarChart2 size={18} />,
  // },
  // {
  //   id: "performance",
  //   label: "Performance",
  //   icon: <LineChart size={18} />,
  // },
  // {
  //   id: "journal",
  //   label: "Journal",
  //   icon: <BookOpen size={18} />,
  // },
];
