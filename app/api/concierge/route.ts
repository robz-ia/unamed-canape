import Anthropic from "@anthropic-ai/sdk";
import { cookies } from "next/headers";
import { getProducts } from "@/lib/data";
import { catalogueForPrompt, loadSkill, ruleBasedAnswer } from "@/lib/concierge";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type Turn = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: Turn[] };
  const history = (messages ?? []).slice(-12).filter((t) => t.content?.trim());
  const last = history.at(-1);
  if (!last || last.role !== "user" || last.content.length > 1000) {
    return Response.json({ error: "Message invalide." }, { status: 400 });
  }

  const products = await getProducts();
  let reply: string;
  let mode: "ia" | "regles" = "regles";

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const system = `${await loadSkill()}\n\n## CATALOGUE (source de vérité, à jour)\n${catalogueForPrompt(products)}`;
      const params = {
        model: "claude-opus-5-5",
        max_tokens: 2000,
        output_config: { effort: "low" as const },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: [{ type: "text" as const, text: system, cache_control: { type: "ephemeral" as const } }],
        messages: history,
      };
      const response = await client.beta.messages.create(
        params as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming
      );
      if (response.stop_reason === "refusal") {
        reply = "Je préfère ne pas répondre à cette demande. Parlons plutôt de votre futur canapé : quelle pièce souhaitez-vous meubler ?";
      } else {
        reply = response.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
      }
      mode = "ia";
    } catch (error) {
      if (error instanceof Anthropic.APIError) console.error("Concierge API error", error.status, error.message);
      else console.error(error);
      reply = ruleBasedAnswer(last.content, products);
    }
  } else {
    reply = ruleBasedAnswer(last.content, products);
  }

  if (!SUPABASE_CONFIGURED) return Response.json({ reply, mode });

  // Journalisation des échanges (analyse des besoins clients côté admin)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sid = (await cookies()).get("uc_sid")?.value ?? "anonymous";
  await supabase.from("concierge_messages").insert([
    { user_id: user?.id ?? null, session_id: sid, role: "user", content: last.content },
    { user_id: user?.id ?? null, session_id: sid, role: "assistant", content: reply },
  ]);

  return Response.json({ reply, mode });
}
