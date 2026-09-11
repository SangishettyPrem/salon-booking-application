export interface QuickActionItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  variant?: "primary" | "secondary";
}
