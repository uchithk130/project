import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold"><SignIn>Log in</SignIn></h1>
      </div>
    </div>
  );
}
