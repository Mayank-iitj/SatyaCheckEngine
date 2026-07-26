import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const pathname = usePathname();

  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  
  // Role based on current portal
  let role = "INVESTOR";
  if (pathname?.startsWith("/cognita")) role = "REGULATOR";
  else if (pathname?.startsWith("/verify") || pathname?.startsWith("/engines")) role = "INVESTOR";

  // Map Clerk user to our expected format
  const user = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : email?.split('@')[0],
    email: email,
    role: role
  } : null;

  const clearAuth = () => {
    signOut();
  };

  // setAuth is deprecated with Clerk
  const setAuth = () => {};

  return { user, setAuth, clearAuth, isLoaded };
}
