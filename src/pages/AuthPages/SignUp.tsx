import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="React.js SignUp Dashboard | AirConnect - Next.js Admin Dashboard Template"
        description="This is React.js SignUp Tables Dashboard page for AirConnect - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
