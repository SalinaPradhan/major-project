import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ResourceUtilizationProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  title: string;
}

export function ResourceUtilization({ data, title }: ResourceUtilizationProps) {
  return (
    <div className="glass-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 10%)',
              border: '1px solid hsl(222, 47%, 16%)',
              borderRadius: '0.5rem',
              color: 'hsl(210, 40%, 98%)',
            }}
            formatter={(value: number) => `${value}`}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'hsl(215, 20%, 55%)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
