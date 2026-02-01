"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { FileText, Users, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        setUser(authService.getCurrentUser());
    }, []);

    const stats = [
        { label: 'Total Documents', value: '0', icon: FileText, color: 'text-blue-500' },
        { label: 'Users', value: '1', icon: Users, color: 'text-green-500' },
        { label: 'Pending Analysis', value: '0', icon: Clock, color: 'text-orange-500' },
        { label: 'Processed', value: '0', icon: CheckCircle, color: 'text-purple-500' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.firstName || 'User'}. Here's what's happening today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold uppercase">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg">
                        No recent activity to show. Start by uploading a document!
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
