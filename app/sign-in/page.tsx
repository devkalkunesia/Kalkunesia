'use client';
import { SignIn } from '@clerk/react';
import Navbar from '@/components/Navbar';
export default function SignInPage() {
  return (
    <>
      <Navbar variant="simple" />
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh' }}>
        <SignIn routing="hash" forceRedirectUrl="/dashboard" />
      </div>
    </>
  );
}
