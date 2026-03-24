import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Play } from "lucide-react";

const Generate = () => (
  <div>
    <PageHeader title="Generate Timetable" description="Run the genetic algorithm to generate optimized schedules">
      <Button size="sm" disabled><Play size={16} className="mr-1" /> Generate</Button>
    </PageHeader>
    <div className="p-6">
      <Card className="p-8 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Calendar size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Ready to generate</p>
          <p className="text-xs mt-1">Ensure all data is entered before running the algorithm</p>
        </div>
      </Card>
    </div>
  </div>
);

export default Generate;
