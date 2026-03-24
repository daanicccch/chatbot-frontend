import { AuthPage } from "@/client/components/auth/auth-page";

function sanitizeNextHref(nextHref: string | undefined) {
  if (!nextHref || !nextHref.startsWith("/") || nextHref.startsWith("//")) {
    return "/";
  }

  return nextHref;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; next?: string }>;
}) {
  const params = await searchParams;
  const initialMode = params.mode === "signup" ? "signup" : "login";
  const nextHref = sanitizeNextHref(params.next);

  return <AuthPage initialMode={initialMode} nextHref={nextHref} />;
}
