"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { documentsService, Document } from '@/services/documents.service';
import {
    FileText,
    Users,
    Clock,
    CheckCircle,
    AlertCircle,
    ShieldCheck,
    PlusCircle,
    Search,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [docs, setDocs] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        const fetchDocs = async () => {
            try {
                const data = await documentsService.getAll();
                setDocs(data);
            } catch (error) {
                console.error('Failed to fetch documents:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocs();
    }, []);

    const isAdmin = user?.role === 'admin';

    const stats = [
        {
            label: 'Total Documents',
            value: docs.length.toString(),
            icon: FileText,
            color: 'text-blue-500',
            description: 'Total archives in system'
        },
        {
            label: isAdmin ? 'Total Users' : 'Team Members',
            value: isAdmin ? '1' : '5', // Placeholder for user count if not in backend
            icon: Users,
            color: 'text-green-500',
            description: isAdmin ? 'Active accounts' : 'Department staff'
        },
        {
            label: 'Pending Analysis',
            value: docs.filter(d => d.analysisStatus === 'pending').length.toString(),
            icon: Clock,
            color: 'text-orange-500',
            description: 'Documents being processed'
        },
        {
            label: 'Fully Processed',
            value: docs.filter(d => d.analysisStatus === 'completed').length.toString(),
            icon: CheckCircle,
            color: 'text-purple-500',
            description: 'Ready for consultation'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? 'Admin Dashboard' : 'Manager Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back, {user?.firstName || 'User'}. Here's the state of your archives.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/documents">
                            <Search className="mr-2 h-4 w-4" />
                            View Archives
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/upload">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Upload New
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Documents</CardTitle>
                        <CardDescription>
                            Latest additions to the DigiArch repository.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-[200px] animate-pulse">
                                Loading data...
                            </div>
                        ) : docs.length > 0 ? (
                            <div className="space-y-4">
                                {docs.slice(0, 5).map((doc) => (
                                    <div key={doc._id} className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-2 rounded">
                                            <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{doc.originalName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(doc.uploadDate).toLocaleDateString()} • {(doc.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${doc.analysisStatus === 'completed' ? 'bg-green-100 text-green-700' :
                                                doc.analysisStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {doc.analysisStatus}
                                        </div>
                                    </div>
                                ))}
                                <Button variant="link" className="w-full text-primary" asChild>
                                    <Link href="/documents">
                                        View all documents <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg">
                                <FileText className="h-10 w-10 mb-2 opacity-20" />
                                No archives found yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{isAdmin ? 'System Management' : 'Archive Tools'}</CardTitle>
                        <CardDescription>
                            Quick access to {isAdmin ? 'admin' : 'manager'} utilities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isAdmin ? (
                            <>
                                <div className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                    <div className="bg-blue-100 p-2 rounded text-blue-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">User Access Controls</p>
                                        <p className="text-xs text-muted-foreground">Manage roles and permissions</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                    <div className="bg-orange-100 p-2 rounded text-orange-600">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">System Logs</p>
                                        <p className="text-xs text-muted-foreground">Audit trail and errors</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                    <div className="bg-blue-100 p-2 rounded text-blue-600">
                                        <Search className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Advanced Search</p>
                                        <p className="text-xs text-muted-foreground">Find docs by metadata</p>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="bg-secondary/30 p-4 rounded-lg">
                            <p className="text-xs font-semibold text-secondary-foreground mb-1 uppercase">Storage Status</p>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                                <div className="bg-primary h-2 rounded-full w-[15%]"></div>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">
                                1.2 GB of 10 GB MinIO storage used
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
