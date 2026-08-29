import { createClient } from "@/lib/supabase-server";
import AskClient from "./AskClient";

export default async function AskPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: messages } = await supabase
    .from("assistant_messages")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at");

  return <AskClient initialMessages={messages ?? []} />;
}
