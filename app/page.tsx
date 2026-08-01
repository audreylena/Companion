import { redirect } from "next/navigation";

// Two surfaces live in this app: the child device (/device) and the parent
// dashboard (/parent). The root opens the child experience — the emotional
// heart of the product — so a visitor meets the companion first.
export default function RootPage() {
  redirect("/device/talk");
}
