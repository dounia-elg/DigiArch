import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
    constructor(private documentsService: DocumentsService) { }

    @Post('upload')
    @Roles(UserRole.ADMIN, UserRole.ARCHIVE_MANAGER)
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(@UploadedFile() file: Express.Multer.File, @Request() req) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException('Only PDF files are allowed');
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File size exceeds 10MB limit');
        }

        return this.documentsService.uploadDocument(file, req.user.userId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.ARCHIVE_MANAGER)
    findAll() {
        return this.documentsService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.ARCHIVE_MANAGER)
    findById(@Param('id') id: string) {
        return this.documentsService.findById(id);
    }

    @Get(':id/url')
    @Roles(UserRole.ADMIN, UserRole.ARCHIVE_MANAGER)
    async getFileUrl(@Param('id') id: string) {
        const url = await this.documentsService.getFileUrl(id);
        return { url };
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    delete(@Param('id') id: string) {
        return this.documentsService.deleteDocument(id);
    }
}
