'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader } from "@mantine/core"
import { useAuthContext } from "./_context/AuthProvider";

export default function HomePage() {
  const { data: loggedInUser, isLoading: authLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {

    if (!loggedInUser) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }, [authLoading, loggedInUser, router]);

  if (authLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  };

  return(
    <div></div>
  )

}
