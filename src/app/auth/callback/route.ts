import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const nomeGoogle =
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          null;

        await supabase
          .from("profiles")
          .update({ termos_aceitos_em: new Date().toISOString() })
          .eq("id", user.id)
          .is("termos_aceitos_em", null);

        if (nomeGoogle) {
          await supabase
            .from("profiles")
            .update({ nome: nomeGoogle })
            .eq("id", user.id)
            .is("nome", null);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
