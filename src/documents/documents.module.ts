import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { MinioService } from './minio.service';
import { AiService } from './ai.service';
import { DocumentFile, DocumentFileSchema } from './document.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: DocumentFile.name, schema: DocumentFileSchema }]),
    ],
    controllers: [DocumentsController],
    providers: [DocumentsService, MinioService, AiService],
    exports: [DocumentsService, MinioService],
})
export class DocumentsModule { }
