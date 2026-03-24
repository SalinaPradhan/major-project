import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";

const Courses = () => (
  <div>
    <PageHeader title="Courses" description="Manage courses and credit hours">
      <Button size="sm"><Plus size={16} className="mr-1" /> Add Course</Button>
    </PageHeader>
    <div className="p-6">
      <Card className="p-8 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No courses added yet</p>
          <p className="text-xs mt-1">Connect to database to manage courses</p>
        </div>
      </Card>
    </div>
  </div>
);

export default Courses;
