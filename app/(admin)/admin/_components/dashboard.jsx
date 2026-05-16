import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metricCards = [
  {
    key: "total",
    label: "Total Cars",
    section: "cars",
  },
  {
    key: "available",
    label: "Available Cars",
    section: "cars",
  },
  {
    key: "pending",
    label: "Pending Test Drives",
    section: "testDrives",
  },
  {
    key: "conversionRate",
    label: "Conversion Rate",
    section: "testDrives",
    suffix: "%",
  },
];

export function Dashboard({ initialData }) {
  if (!initialData?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {initialData?.error || "Dashboard data is not available."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metricCards.map(({ key, label, section, suffix = "" }) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {initialData.data[section][key]}
              {suffix}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}