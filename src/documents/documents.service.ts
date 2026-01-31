import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentFile } from './document.schema';
import { MinioService } from './minio.service';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectModel(DocumentFile.name) private documentModel: Model<DocumentFile>,
        private minioService: MinioService,
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
        });

        return document;
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
