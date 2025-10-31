'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core"
import { AuthProvider, useAuthContext } from "./_context/AuthProvider";

export default function HomePage() {
  const { loggedInUser, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if(!loading && !loggedInUser) {
      router.push("/login");
    } else if(!loading && loggedInUser) {
      router.push("/dashboard");
    }
  }, [loading, loggedInUser, router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader/>
      </Center>
    );
  };

}
