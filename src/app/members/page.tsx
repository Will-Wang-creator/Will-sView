import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { MembersPageContent } from "@/components/MembersPageContent";

export default async function MembersPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <MembersPageContent
      user={{
        id: user.id,
        name: user.name,
        isSubscribed: user.isSubscribed,
        memberSince: user.memberSince,
        subscriptionEnd: user.subscriptionEnd ?? null,
      }}
    />
  );
}
