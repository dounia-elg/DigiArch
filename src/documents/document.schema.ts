import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class ExtractedData {
    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop()
    cin?: string;

    @Prop()
    department?: string;

    @Prop()
    documentType?: string;
}

@Schema({ timestamps: true })
export class DocumentFile extends Document {
    @Prop({ required: true })
    filename: string;

    @Prop({ required: true })
    originalName: string;

    @Prop({ required: true })
    mimeType: string;

    @Prop({ required: true })
    size: number;

    @Prop({ required: true })
    minioPath: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    uploadedBy: Types.ObjectId;

    @Prop()
    uploadDate: Date;

    @Prop({ type: ExtractedData })
    extractedData?: ExtractedData;

    @Prop({ default: false })
    signatureDetected: boolean;

    @Prop({ enum: ['pending', 'completed', 'failed'], default: 'pending' })
    analysisStatus: string;

    @Prop()
    analysisError?: string;
}

export const DocumentFileSchema = SchemaFactory.createForClass(DocumentFile);
