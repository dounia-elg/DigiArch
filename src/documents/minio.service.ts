import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
    private minioClient: Minio.Client;
    private bucketName: string;

    constructor() {
        this.bucketName = process.env.MINIO_BUCKET || 'digiarch-documents';
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });
    }

    async onModuleInit() {
        await this.ensureBucketExists();
    }

    private async ensureBucketExists() {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        }
    }

    async uploadFile(file: Express.Multer.File, filename: string): Promise<string> {
        const objectName = `${Date.now()}-${filename}`;
        await this.minioClient.putObject(
            this.bucketName,
            objectName,
            file.buffer,
            file.size,
            {
                'Content-Type': file.mimetype,
            },
        );
        return objectName;
    }

    async getFile(objectName: string): Promise<Buffer> {
        const stream = await this.minioClient.getObject(this.bucketName, objectName);
        const chunks: Buffer[] = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

    async deleteFile(objectName: string): Promise<void> {
        await this.minioClient.removeObject(this.bucketName, objectName);
    }

    async getFileUrl(objectName: string): Promise<string> {
        return await this.minioClient.presignedGetObject(this.bucketName, objectName, 24 * 60 * 60);
    }

    async fileExists(objectName: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(this.bucketName, objectName);
            return true;
        } catch (error) {
            if (error.code === 'NotFound') return false;
            throw error;
        }
    }

    async copyFile(sourcePath: string, destPath: string): Promise<void> {
        const conds = new Minio.CopyConditions();
        await this.minioClient.copyObject(this.bucketName, destPath, `/${this.bucketName}/${sourcePath}`, conds);
    }

    async moveFile(sourcePath: string, destPath: string): Promise<void> {
        if (sourcePath === destPath) return;
        await this.copyFile(sourcePath, destPath);
        await this.deleteFile(sourcePath);
    }
}

