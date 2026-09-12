"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    router.replace(`/auth?mode=login${params ? `&${params}` : ""}`);
  }, [router, searchParams]);

  return null;
}
