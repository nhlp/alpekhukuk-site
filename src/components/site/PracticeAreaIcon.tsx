import {
  Scale,
  Users,
  Briefcase,
  Shield,
  Gavel,
  FileText,
  Landmark,
  Banknote,
  Heart,
  Building2,
  type LucideIcon,
} from "lucide-react";

export const practiceAreaIcons: Record<string, LucideIcon> = {
  scale: Scale,
  users: Users,
  briefcase: Briefcase,
  shield: Shield,
  gavel: Gavel,
  "file-text": FileText,
  landmark: Landmark,
  banknote: Banknote,
  heart: Heart,
  building: Building2,
};

export const iconOptions = Object.keys(practiceAreaIcons);

export function PracticeAreaIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = practiceAreaIcons[icon] ?? Scale;
  return <Icon className={className} strokeWidth={1.5} />;
}
