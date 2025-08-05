import Profile from "../../components/Profile";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <Profile session={session} />
    </main>
  );
}
