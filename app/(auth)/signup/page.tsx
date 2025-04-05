import SignUpPage from "@/components/Pages/SignUpPage";
import { Suspense } from "react";
import Loader from "@/components/Loader";

export default function SignUp() {
  return (
    <Suspense fallback={<Loader />}>
      <SignUpPage />
    </Suspense>
  )
}

