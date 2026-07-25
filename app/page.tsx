import { redirect } from "next/navigation";

// Two surfaces live in this app: the parent dashboard (/parent) and the
// child device (/device). The root sends visitors to the parent dashboard.
export default function RootPage() {
  redirect("/parent");
}
