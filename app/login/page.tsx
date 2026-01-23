'use client';
import { useRouter } from "next/navigation";
import { useAuthContext } from "../_context/AuthProvider";
import { AuthenticationImage } from "./_AuthenticationImage/AuthenticationImage";

export default function LoginPage() {

  const { data: loggedInUser, isLoading: authLoading, refetch  } = useAuthContext();
  const router = useRouter();

  const onSuccess = async () => {
    refetch();
    router.push('/dashboard')
  }


  return <div>
    <AuthenticationImage onSuccess={onSuccess}/>
  </div>;
}
