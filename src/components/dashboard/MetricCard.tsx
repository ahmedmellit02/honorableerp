import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: string;
  unapprovedCount?: number;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  gradient = "bg-gradient-ocean",
  unapprovedCount 
}: MetricCardProps) => {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }[changeType];

  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${gradient}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className={`text-xs ${changeColor} mt-1`}>
            {change}
          </p>
        )}
        {unapprovedCount !== undefined && unapprovedCount > 0 && (
          <p className="text-xs text-destructive mt-1">
            Charges en attente d’approbation : {unapprovedCount}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;