import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

const SignInPage = () => {
  const { theme } = useTheme();

  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      appearance={{
        elements: { rootBox: "mx-auto" },
        baseTheme: theme === "dark" ? dark : undefined,
      }}
    />
  );
};

export default SignInPage;
