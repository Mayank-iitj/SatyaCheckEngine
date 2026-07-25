import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const pathname = usePathname();

  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  
  // Dynamically assign role based on the portal they are accessing
  let role = "STUDENT";
  if (pathname?.startsWith("/admin")) role = "ADMIN";
  else if (pathname?.startsWith("/university")) role = "UNIVERSITY";
  else if (pathname?.startsWith("/recruiter")) role = "RECRUITER";

  // Map Clerk user to our expected legacy format
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
