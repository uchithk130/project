// clerk.js
import { ClerkProvider } from '@clerk/nextjs';

export const ClerkWrapper = ({ children }) => {
  return (
    <ClerkProvider frontendApi={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
};
