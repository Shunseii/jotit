import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <SignIn
    path="/sign-in"
    routing="path"
    signUpUrl="/sign-up"
    afterSignInUrl="/"
    appearance={{ elements: { rootBox: "mx-auto" } }}
  />
);

export default SignInPage;
