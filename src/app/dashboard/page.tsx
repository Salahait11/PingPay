"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectByRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      let role = "user";
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (data?.role) role = data.role;
      }
      if (role === "admin") router.replace("/dashboard/admin");
      else if (role === "business") router.replace("/dashboard/business");
      else router.replace("/dashboard/user");
    };
    redirectByRole();
  }, [router]);

  return null;
}