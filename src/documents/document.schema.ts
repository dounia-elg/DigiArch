import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
}

export const DocumentFileSchema = SchemaFactory.createForClass(DocumentFile);
