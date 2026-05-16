import CarsList from "../../cars/_components/car-list";


export const metadata = {
  title: "Cars | Vehiql Admin",
  description: "Manage cars in your marketplace",
};

export default function AdminCarsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cars Management</h1>
      <CarsList />
    </div>
  );
}