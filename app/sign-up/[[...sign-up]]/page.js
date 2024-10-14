import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold"><SignUp></SignUp></h1>
      </div>
    </div>
  );
}


