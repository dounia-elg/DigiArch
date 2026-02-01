import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UserRole } from './users/user.schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    const email = 'admin@digiarch.com';
    const password = 'admin123';

    try {
        const user = await authService.register({
            email,
            password,
            role: UserRole.ADMIN,
        });
        console.log('✅ Admin user created successfully:', user.email);
    } catch (error) {
        if (error.status === 409) {
            console.log('ℹ️ Admin user already exists.');
        } else {
            console.error('❌ Error creating admin:', error.message);
        }
    }

    await app.close();
}

bootstrap();
