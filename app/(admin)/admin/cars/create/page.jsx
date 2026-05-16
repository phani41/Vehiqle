import { AddCarForm } from "../../../cars/_components/add-car-form";

export const metadata = {
  title: "Add New Car | Vehiql Admin",
  description: "Add a new car to your marketplace",
};

export default function AdminAddCarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
      <AddCarForm />
    </div>
  );
}