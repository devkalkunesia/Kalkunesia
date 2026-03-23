'use client';
import { SignUp } from '@clerk/react';
import Navbar from '@/components/Navbar';
export default function SignUpPage() {
  return (
    <>
      <Navbar variant="simple" />
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh' }}>
        <SignUp routing="hash" forceRedirectUrl="/dashboard" />
      </div>
    </>
  );
}
