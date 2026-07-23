import { redirect } from "next/navigation";

// Scripture now lives as a tab inside Discussions.
// This route is kept only to redirect any old links.
export default function ScriptureRedirect() {
  redirect("/discussions");
}
