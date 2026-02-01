"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FileText,
    Upload,
    X,
    CheckCircle,
    AlertCircle,
    FileCheck,
    ArrowRight,
    Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { documentsService } from '@/services/documents.service';

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [uploadedDoc, setUploadedDoc] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        setError(null);

        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are supported.');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB.');
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            const doc = await documentsService.uploadDocument(file);
            setUploadedDoc(doc);
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setError(null);
        setIsSuccess(false);
        setUploadedDoc(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (isSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Upload Successful!</CardTitle>
                        <CardDescription>
                            Your document "{uploadedDoc?.originalName}" has been uploaded and is being analyzed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg flex items-center gap-4 text-left">
                            <div className="bg-primary/10 p-2 rounded">
                                <FileCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{uploadedDoc?.originalName}</p>
                                <p className="text-xs text-muted-foreground uppercase">
                                    Status: {uploadedDoc?.analysisStatus}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            Note: Metadata extraction and file structuring usually take a few seconds.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" asChild>
                            <Link href="/dashboard">
                                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full" onClick={reset}>
                            Upload Another
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Upload Archive</h1>
                <p className="text-muted-foreground">
                    Select a PDF document to upload into the DigiArch repository.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const droppedFile = e.dataTransfer.files[0];
                            if (droppedFile) validateAndSetFile(droppedFile);
                        }}
                    >
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center gap-4">
                            {file ? (
                                <div className="bg-primary/20 p-4 rounded-full">
                                    <FileText className="h-10 w-10 text-primary" />
                                </div>
                            ) : (
                                <div className="bg-muted p-4 rounded-full">
                                    <Upload className="h-10 w-10 text-muted-foreground" />
                                </div>
                            )}

                            <div>
                                <p className="text-lg font-semibold">
                                    {file ? file.name : 'Click or drag PDF here'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size: 10MB'}
                                </p>
                            </div>

                            {file && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        reset();
                                    }}
                                >
                                    <X className="mr-2 h-4 w-4" /> Remove File
                                </Button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-muted/50 py-4 flex justify-between items-center rounded-b-lg">
                    <p className="text-xs text-muted-foreground italic">
                        Uploaded documents will be automatically indexed using AI.
                    </p>
                    <Button
                        disabled={!file || isLoading}
                        onClick={handleUpload}
                        className="px-8"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Uploading...' : 'Upload Now'}
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-card text-card-foreground">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Supported Format
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Currently we only support standard PDF files for document analysis and structuring.
                    </p>
                </div>
                <div className="p-4 border rounded-lg bg-card text-card-foreground">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Automatic Analysis
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        AI will detect CIN, names, and departments to automatically route your files.
                    </p>
                </div>
            </div>
        </div>
    );
}
