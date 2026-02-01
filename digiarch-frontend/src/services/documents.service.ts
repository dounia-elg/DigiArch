import api from '../lib/axios';

export interface Document {
    _id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    minioPath: string;
    uploadedBy: any;
    uploadDate: string;
    analysisStatus: string;
    extractedData?: {
        firstName?: string;
        lastName?: string;
        cin?: string;
        department?: string;
        documentType?: string;
    };
}

export const documentsService = {
    async getAll(): Promise<Document[]> {
        const response = await api.get<Document[]>('/documents');
        return response.data;
    },

    async getById(id: string): Promise<Document> {
        const response = await api.get<Document>(`/documents/${id}`);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/documents/${id}`);
    },

    async getFileUrl(id: string): Promise<string> {
        const response = await api.get<{ url: string }>(`/documents/${id}/url`);
        return response.data.url;
    }
};
