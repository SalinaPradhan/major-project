import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";

const Faculty = () => (
  <div>
    <PageHeader title="Faculty" description="Manage faculty members and their preferences">
      <Button size="sm"><Plus size={16} className="mr-1" /> Add Faculty</Button>
    </PageHeader>
    <div className="p-6">
      <Card className="p-8 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No faculty added yet</p>
          <p className="text-xs mt-1">Connect to database to manage faculty</p>
        </div>
      </Card>
    </div>
  </div>
);

export default Faculty;
