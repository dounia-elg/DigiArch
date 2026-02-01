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
    Upload,
    Search,
    ArrowRight,
    TrendingUp,
    History
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
        },
        {
            label: isAdmin ? 'Total Users' : 'Processed Files',
            value: isAdmin ? '1' : docs.filter(d => d.analysisStatus === 'completed').length.toString(),
            icon: isAdmin ? Users : CheckCircle,
            color: 'text-green-500',
        },
        {
            label: 'Pending Analysis',
            value: docs.filter(d => d.analysisStatus === 'pending').length.toString(),
            icon: Clock,
            color: 'text-orange-500',
        },
        {
            label: isAdmin ? 'Processing Rate' : 'System Health',
            value: docs.length > 0 ? `${Math.round((docs.filter(d => d.analysisStatus === 'completed').length / docs.length) * 100)}%` : '100%',
            icon: TrendingUp,
            color: 'text-purple-500',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? 'System Overview' : 'Archive Dashboard'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isAdmin
                            ? `Administration portal for ${user?.firstName || 'User'}.`
                            : `Welcome back, ${user?.firstName || 'User'}. Manage and consult your archives.`}
                    </p>
                </div>
            </div>

            {!isAdmin && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-primary hover:text-primary transition-all" asChild>
                        <Link href="/upload">
                            <Upload className="h-6 w-6" />
                            <span className="font-semibold">Upload Document</span>
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-primary hover:text-primary transition-all" asChild>
                        <Link href="/documents">
                            <Search className="h-6 w-6" />
                            <span className="font-semibold">Search Archives</span>
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-dashed border-2 hover:border-primary hover:text-primary transition-all" asChild>
                        <Link href="/documents">
                            <FileText className="h-6 w-6" />
                            <span className="font-semibold">Consult Documents</span>
                        </Link>
                    </Button>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Documents</CardTitle>
                            <CardDescription>Latest processed archives.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/documents">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />)}
                            </div>
                        ) : docs.length > 0 ? (
                            <div className="space-y-4">
                                {docs.slice(0, 5).map((doc) => (
                                    <div key={doc._id} className="flex items-center gap-4 p-2 hover:bg-muted/50 rounded-lg transition-colors group">
                                        <div className="bg-primary/10 p-2 rounded group-hover:bg-primary/20 transition-colors">
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
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                            <Link href={`/documents/${doc._id}`}>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg">
                                <FileText className="h-10 w-10 mb-2 opacity-20" />
                                No documents found.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{isAdmin ? 'System Information' : 'Activity Summary'}</CardTitle>
                        <CardDescription>
                            {isAdmin ? 'System status and logs' : 'Your recent contributions'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-muted rounded">
                                    <History className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Last Upload</p>
                                    <p className="text-xs text-muted-foreground">
                                        {docs.length > 0 ? new Date(docs[0].uploadDate).toLocaleString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-muted rounded">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Monthly Archive Volume</p>
                                    <p className="text-xs text-muted-foreground">
                                        {docs.length} documents indexed this month
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Help & Documentation</p>
                            <div className="space-y-2">
                                <p className="text-xs text-blue-600 hover:underline cursor-pointer">How to upload multiple files?</p>
                                <p className="text-xs text-blue-600 hover:underline cursor-pointer">Editing extracted metadata</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
