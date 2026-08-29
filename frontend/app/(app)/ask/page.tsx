import { apiFetchServer } from "@/lib/api-server";
import AskClient from "./AskClient";

export default async function AskPage() {
  const messages = (await apiFetchServer("/assistant/messages")) ?? [];

  return <AskClient initialMessages={messages} />;
}
