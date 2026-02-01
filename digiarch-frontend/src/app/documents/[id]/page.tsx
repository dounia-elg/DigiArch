"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    ArrowLeft,
    FileText,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Download,
    Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { documentsService, Document } from '@/services/documents.service';

const metadataSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    cin: z.string().optional(),
    department: z.string().optional(),
    documentType: z.string().optional(),
});

type MetadataFormValues = z.infer<typeof metadataSchema>;

export default function DocumentDetailsPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };

    const [doc, setDoc] = useState<Document | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<MetadataFormValues>({
        resolver: zodResolver(metadataSchema),
    });

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const [docData, url] = await Promise.all([
                    documentsService.getById(id),
                    documentsService.getFileUrl(id)
                ]);
                setDoc(docData);
                setFileUrl(url);
                reset({
                    firstName: docData.extractedData?.firstName || '',
                    lastName: docData.extractedData?.lastName || '',
                    cin: docData.extractedData?.cin || '',
                    department: docData.extractedData?.department || '',
                    documentType: docData.extractedData?.documentType || '',
                });
            } catch (err) {
                setError('Failed to load document details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoc();
    }, [id, reset]);

    const onSubmit = async (data: MetadataFormValues) => {
        setIsSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const updated = await documentsService.updateMetadata(id, data);
            setDoc(updated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update metadata.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            try {
                await documentsService.delete(id);
                router.push('/dashboard');
            } catch (err) {
                setError('Failed to delete document.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error && !doc) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg font-medium">{error}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight truncate max-w-[400px]">
                            {doc?.originalName}
                        </h1>
                        <p className="text-sm text-muted-foreground uppercase">
                            Status: {doc?.analysisStatus}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <a href={fileUrl || '#'} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View PDF
                        </a>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Metadata Management</CardTitle>
                        <CardDescription>
                            Correct or update the information extracted from the document.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-100 text-green-700 text-sm p-3 rounded-md border border-green-200 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Metadata updated successfully!
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" {...register('firstName')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" {...register('lastName')} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cin">CIN (Identity Number)</Label>
                                <Input id="cin" {...register('cin')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input id="department" {...register('department')} placeholder="e.g. HR, Finance" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="documentType">Document Type</Label>
                                <Input id="documentType" {...register('documentType')} placeholder="e.g. Contract, Invoice" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t py-4 mt-6">
                            <p className="text-xs text-muted-foreground italic max-w-[200px]">
                                Saving changes may trigger a file restructure in the storage system.
                            </p>
                            <Button type="submit" disabled={isSaving || !isDirty}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <Card className="flex flex-col h-[600px]">
                    <CardHeader>
                        <CardTitle>File Preview</CardTitle>
                        <CardDescription>
                            Reference the original document while editing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 bg-muted/20 relative">
                        {fileUrl ? (
                            <iframe
                                src={`${fileUrl}#toolbar=0`}
                                className="w-full h-full border-none rounded-b-lg"
                                title="Document Preview"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                                <FileText className="h-12 w-12 mb-4 opacity-20" />
                                <p>Preview loading or unavailable.</p>
                                <Button variant="link" asChild>
                                    <a href={fileUrl || '#'} target="_blank" rel="noopener noreferrer">Try opening in new tab</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
