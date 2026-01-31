import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentFile } from './document.schema';
import { MinioService } from './minio.service';
import { AiService } from './ai.service';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectModel(DocumentFile.name) private documentModel: Model<DocumentFile>,
        private minioService: MinioService,
        private aiService: AiService,
    ) { }

    async uploadDocument(file: Express.Multer.File, userId: string) {
        const minioPath = await this.minioService.uploadFile(file, file.originalname);

        const document = await this.documentModel.create({
            filename: file.originalname,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            minioPath,
            uploadedBy: userId,
            uploadDate: new Date(),
            analysisStatus: 'pending',
        });

        this.analyzeDocumentAsync(document._id.toString(), file.buffer);

        return document;
    }

    private async analyzeDocumentAsync(documentId: string, fileBuffer: Buffer) {
        try {
            const analysis = await this.aiService.analyzeDocument(fileBuffer);

            const document = await this.documentModel.findByIdAndUpdate(documentId, {
                extractedData: {
                    firstName: analysis.firstName,
                    lastName: analysis.lastName,
                    cin: analysis.cin,
                    department: analysis.department,
                    documentType: analysis.documentType,
                },
                signatureDetected: analysis.signatureDetected,
                analysisStatus: 'completed',
            }, { new: true });

            if (document) {
                await this.structureDocument(document);
            }

        } catch (error) {
            console.error('Analysis/Structuring Error:', error);
            await this.documentModel.findByIdAndUpdate(documentId, {
                analysisStatus: 'failed',
                analysisError: error.message,
            });
        }
    }

    private async structureDocument(document: DocumentFile) {
        if (!document.extractedData) return;

        const { firstName, lastName, cin, department, documentType } = document.extractedData;

        // 1. Generate User Folder Name
        let userFolder = 'Unknown_User';
        if (lastName && firstName) {
            const safeLastName = this.sanitizeString(lastName);
            const safeFirstName = this.sanitizeString(firstName);
            if (cin) {
                userFolder = `${safeLastName}_${safeFirstName}_${this.sanitizeString(cin)}`;
            } else {
                userFolder = `${safeLastName}_${safeFirstName}_no-cin`;
            }
        }

        // 2. Generate Subfolders
        const safeDepartment = department ? this.sanitizeString(department) : 'General';
        const safeDocType = documentType ? this.sanitizeString(documentType) : 'Uncategorized';

        // 3. Construct New Path
        const newFilename = `${this.sanitizeString(document.originalName)}`;
        const newPath = `${userFolder}/${safeDepartment}/${safeDocType}/${newFilename}`;

        // 4. Move File in MinIO
        try {
            await this.minioService.moveFile(document.minioPath, newPath);

            // 5. Update Database
            document.minioPath = newPath;
            await document.save();
        } catch (error) {
            console.error(`Failed to move file from ${document.minioPath} to ${newPath}:`, error);
        }
    }

    private sanitizeString(str: string): string {
        return str.replace(/[^a-zA-Z0-9-_]/g, '_');
    }

    async findAll() {
        return this.documentModel.find().populate('uploadedBy', 'email role').exec();
    }

    async findById(id: string) {
        const document = await this.documentModel.findById(id).populate('uploadedBy', 'email role').exec();
        if (!document) {
            throw new NotFoundException('Document not found');
        }
        return document;
    }

    async getFileUrl(id: string): Promise<string> {
        const document = await this.findById(id);
        return this.minioService.getFileUrl(document.minioPath);
    }

    async deleteDocument(id: string) {
        const document = await this.findById(id);
        await this.minioService.deleteFile(document.minioPath);
        await this.documentModel.findByIdAndDelete(id);
        return { message: 'Document deleted successfully' };
    }
}
