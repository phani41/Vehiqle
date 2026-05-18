import LInk from 'next/link';
import { Button } from '@/components/ui/button';


export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-title mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">page Not Found</h2>
            <p className="text-gray-600 mb-8">Oops! The page you&apos;re looking for doesn&pos;t exit or has been moved.</p>
            <LInk href="/" >
                <Button>Return Home</Button>
            </LInk>
            </div>
    );
}