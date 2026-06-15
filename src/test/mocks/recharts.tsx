import React from 'react';

type TooltipProps = {
  content?: React.ReactElement;
  formatter?: (value: unknown, name?: unknown) => unknown;
};

function MockTooltip({ content, formatter }: TooltipProps) {
  if (formatter) {
    const result = formatter(1500);
    return <div>{String(Array.isArray(result) ? result[0] : result)}</div>;
  }
  if (!content) return null;
  const C = content.type as React.ComponentType<{
    active?: boolean;
    payload?: { name?: string; value?: number }[];
    label?: string;
  }>;
  return (
    <>
      <C active payload={[{ name: 'Transport', value: 2000 }, { value: 100 }]} label="Jan" />
      <C active={false} payload={[]} label="" />
    </>
  );
}

export function createRechartsMock() {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Pie: () => <div />,
    BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Area: () => null,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: MockTooltip,
  };
}
