import { SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

const SignUpPage = () => {
  const { theme } = useTheme();

  <SignUp
    path="/sign-up"
    routing="path"
    signInUrl="/sign-in"
    afterSignUpUrl="/"
    appearance={{
      elements: { rootBox: "mx-auto" },
      baseTheme: theme === "dark" ? dark : undefined,
    }}
  />;
};

export default SignUpPage;
