import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  let role = "STUDENT";
  if (email === "admin@proofmind.edu") role = "ADMIN";
  else if (email === "harvard@proofmind.edu") role = "UNIVERSITY";
  else if (email === "recruiter@google.com") role = "RECRUITER";

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
