'use client'; // 👈 MUST be at the very top

import { SignIn } from "@clerk/nextjs";
import React from "react";

const SignInPage = () => {
  return <SignIn />;
};

export default SignInPage;
