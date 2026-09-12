import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MapViewV2 } from "@/components/map/map-view-v2";

export default async function MapPage() {
  const session = await auth();

  // Bulletproof Server-Side Redirect
  if (!session?.user) {
    redirect("/auth?mode=login&redirectTo=/map");
  }

  return <MapViewV2 session={session} />;
}
