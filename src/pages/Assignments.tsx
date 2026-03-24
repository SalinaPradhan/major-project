import PageHeader from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Link2 } from "lucide-react";

const Assignments = () => (
  <div>
    <PageHeader title="Teaching Assignments" description="Assign faculty to courses and batches" />
    <div className="p-6">
      <Card className="p-8 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Link2 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No assignments yet</p>
          <p className="text-xs mt-1">Add faculty and courses first</p>
        </div>
      </Card>
    </div>
  </div>
);

export default Assignments;
