import Loader from "@/components/Loader";
import SignInPage from "@/components/Pages/SignInPage";
import { Suspense } from "react";

export default function SignIn() {
  return (
    <Suspense fallback={<Loader />}>
      <SignInPage />
    </Suspense>
  )
}

