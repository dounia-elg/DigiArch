import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
const pdfParse = require('pdf-parse');

export interface AnalysisResult {
    firstName?: string;
    lastName?: string;
    cin?: string;
    department?: string;
    documentType?: string;
    signatureDetected: boolean;
}

@Injectable()
export class AiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async analyzeDocument(fileBuffer: Buffer): Promise<AnalysisResult> {
        try {
            const text = await this.extractTextFromPDF(fileBuffer);
            const analysis = await this.extractInformation(text);
            return analysis;
        } catch (error) {
            console.error('AI Analysis Error:', error);
            throw error;
        }
    }

    private async extractTextFromPDF(buffer: Buffer): Promise<string> {
        const data = await pdfParse(buffer);
        return data.text;
    }

    private async extractInformation(text: string): Promise<AnalysisResult> {
        const prompt = `Analyze the following document text and extract the following information in JSON format:
- firstName (prénom): The first name of the document owner
- lastName (nom): The last name of the document owner
- cin: The CIN (Carte d'Identité Nationale) number if present
- department (département): The department responsible for this document (e.g., RH, Finance, IT)
- documentType (type de document): The type of document (e.g., Demande de congé, Attestation de travail, Fiche de paie)
- signatureDetected: boolean indicating if a signature is mentioned or detected in the text

If any field is not found or unclear, set it to null. Return ONLY valid JSON, no additional text.

Document text:
${text}

JSON Response:`;

        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a document analysis assistant. Extract structured information from documents and return only valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');

        return {
            firstName: result.firstName || null,
            lastName: result.lastName || null,
            cin: result.cin || null,
            department: result.department || null,
            documentType: result.documentType || null,
            signatureDetected: result.signatureDetected || false,
        };
    }
}
