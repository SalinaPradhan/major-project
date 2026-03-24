import PageHeader from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Cog } from "lucide-react";

const Settings = () => (
  <div>
    <PageHeader title="Settings" description="Configure system parameters and constraints" />
    <div className="p-6">
      <Card className="p-8 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Cog size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">System settings</p>
          <p className="text-xs mt-1">GA parameters, time slots, and constraint weights</p>
        </div>
      </Card>
    </div>
  </div>
);

export default Settings;
