import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Home, LogOut, User } from 'lucide-react';

export const Navbar = () => {
    return (
        <nav className="border-b bg-background h-16 flex items-center px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl mr-8">
                <div className="bg-primary text-primary-foreground p-1 rounded">
                    <FileText size={20} />
                </div>
                DigiArch
            </Link>

            <div className="ml-auto flex items-center gap-4">
                <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </Button>
                <Button variant="ghost" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </nav>
    );
};
