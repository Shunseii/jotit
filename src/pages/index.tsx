import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      void router.push("/sign-up");
    } else {
      void router.push("/app");
    }
  }, [isSignedIn, router]);

  return <div />;
};

export default Home;
