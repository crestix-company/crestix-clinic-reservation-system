import { redirect } from "next/navigation";

export default function PatientsPage() {
  redirect("/admin/reservations");
}
