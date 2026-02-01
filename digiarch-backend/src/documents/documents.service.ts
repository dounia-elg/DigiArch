import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentFile } from './document.schema';
import { MinioService } from './minio.service';
import { AiService } from './ai.service';
import { UpdateDocumentMetadataDto } from './dto/update-document-metadata.dto';

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

    async updateDocumentMetadata(id: string, updateDto: UpdateDocumentMetadataDto) {
        const document = await this.findById(id);

        if (!document.extractedData) {
            document.extractedData = {} as any;
        }

        // Merge updates
        document.extractedData = {
            ...document.extractedData,
            ...updateDto
        };

        

        await this.structureDocument(document);

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

        let newPath = '';
        const safeDepartment = department ? this.sanitizeString(department) : 'General';
        const safeDocType = documentType ? this.sanitizeString(documentType) : 'Uncategorized';

        if (cin) {
            const safeLastName = lastName ? this.sanitizeString(lastName) : 'Unknown';
            const safeFirstName = firstName ? this.sanitizeString(firstName) : 'User';
            const safeCin = this.sanitizeString(cin);

            const userFolder = `${safeLastName}_${safeFirstName}_${safeCin}`;
            const newFilename = `${this.sanitizeString(document.originalName)}`;

            newPath = `${userFolder}/${safeDepartment}/${safeDocType}/${newFilename}`;
        } else {
            const safeLastName = lastName ? this.sanitizeString(lastName) : 'Unknown';
            const safeFirstName = firstName ? this.sanitizeString(firstName) : 'User';

            const fileExt = document.originalName.split('.').pop() || 'pdf';
            const newFilename = `${safeDocType}_${safeLastName}_${safeFirstName}.${fileExt}`;

            newPath = `${safeDepartment}/${newFilename}`;
        }

        let version = 1;
        const extensionIndex = newPath.lastIndexOf('.');
        const basePath = newPath.substring(0, extensionIndex);
        const extension = newPath.substring(extensionIndex);

        

        if (newPath !== document.minioPath) {
            while (await this.minioService.fileExists(newPath)) {
                newPath = `${basePath}_v${version}${extension}`;
                version++;
            }
        }

        try {
            if (newPath !== document.minioPath) {
                await this.minioService.moveFile(document.minioPath, newPath);

                const oldJsonPath = document.minioPath.replace('.pdf', '.json');
                if (await this.minioService.fileExists(oldJsonPath)) {
                    await this.minioService.deleteFile(oldJsonPath);
                }

                document.minioPath = newPath;
            }

            const currentJsonPath = document.minioPath.replace('.pdf', '.json');
            const metadata = this.generateMetadataJson(document);
            const buffer = Buffer.from(JSON.stringify(metadata, null, 2));

            await this.minioService.saveFile(currentJsonPath, buffer, 'application/json');

            await document.save();
        } catch (error) {
            console.error(`Failed to restructure file:`, error);
        }
    }

    private generateMetadataJson(document: DocumentFile): any {
        return {
            id: document._id,
            originalName: document.originalName,
            uploadDate: document.uploadDate,
            uploadedBy: document.uploadedBy,
            extractedData: document.extractedData,
            signatureDetected: document.signatureDetected,
            analysisStatus: document.analysisStatus,
            structureVersion: "1.0",
            lastModified: new Date()
        };
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

        const jsonPath = document.minioPath.replace('.pdf', '.json');
        if (await this.minioService.fileExists(jsonPath)) {
            await this.minioService.deleteFile(jsonPath);
        }

        await this.documentModel.findByIdAndDelete(id);
        return { message: 'Document deleted successfully' };
    }
}
