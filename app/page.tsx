'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core"
import { useAuthContext } from "./_context/AuthProvider";

export default function HomePage() {
  const { loggedInUser, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!loggedInUser) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }, [loading, loggedInUser, router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  };

}
