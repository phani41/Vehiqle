
import HeaderAuth from "./header-auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
const Header = async ({ isAdminPage = false }) => {
    const user = await checkUser();
    const isAdmin = user?.role === "ADMIN";

    return (
        <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
            <nav className="mx-auto px-4 py-4 flex items-center justify-between">
                <Link href={isAdmin ? "/admin" : "/"} className="flex">
                    <Image src={'/logo.png'} alt={'car Logo'} width={200} height={60} className="h-12 w-auto object-contain" />
                    {isAdminPage && <span className="text-xs font-extralight">admin</span>}
                </Link>

                <div className="flex items-center space-x-4">
                    {isAdminPage ? (
                        <Button asChild variant="outline" className="flex items-center gap-2">
                            <Link href="/">
                                <>
                                    <ArrowLeft size={18} />
                                    <span>Back to App</span>
                                </>
                            </Link>
                        </Button>
                    ) : (
                        <HeaderAuth isAdmin={isAdmin} />
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;