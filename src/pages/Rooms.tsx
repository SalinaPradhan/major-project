import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, DoorOpen } from "lucide-react";

const Rooms = () => (
  <div>
    <PageHeader title="Rooms" description="Manage classrooms, labs, and their capacities">
      <Button size="sm"><Plus size={16} className="mr-1" /> Add Room</Button>
    </PageHeader>
    <div className="p-6">
      <Card className="p-8 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <DoorOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No rooms added yet</p>
          <p className="text-xs mt-1">Connect to database to manage rooms</p>
        </div>
      </Card>
    </div>
  </div>
);

export default Rooms;
