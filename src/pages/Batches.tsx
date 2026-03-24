import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, GraduationCap } from "lucide-react";

const Batches = () => (
  <div>
    <PageHeader title="Batches" description="Manage student batches and sections">
      <Button size="sm"><Plus size={16} className="mr-1" /> Add Batch</Button>
    </PageHeader>
    <div className="p-6">
      <Card className="p-8 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <GraduationCap size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No batches added yet</p>
          <p className="text-xs mt-1">Connect to database to manage batches</p>
        </div>
      </Card>
    </div>
  </div>
);

export default Batches;
