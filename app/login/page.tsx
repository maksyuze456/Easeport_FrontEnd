'use client';
import { useRouter } from "next/navigation";
import { useAuthContext } from "../_context/AuthProvider";
import { wsClient } from "../../lib/ws/wsClient";
import { signIn } from "../../features/auth/api/auth";
import { AuthenticationImage } from "../../features/auth/components/AuthenticationImage/AuthenticationImage";


export default function LoginPage() {

  const { isLoading: authLoading, refetch } = useAuthContext();
  const router = useRouter();

  const onSuccess = async () => {
    refetch();
    wsClient.connect();
    router.push('/dashboard')
  }

  const handleLogin = async (username: string, password: string) => {
    let res = await signIn(username, password);
    if (res.status === 200) {
      onSuccess();
    }
  }


  return <div>
    <AuthenticationImage handleLogin={handleLogin} isLoading={authLoading} />
  </div>;
}
