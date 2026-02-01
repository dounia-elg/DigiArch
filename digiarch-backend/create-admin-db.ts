import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGODB_URI = 'mongodb://localhost:27017/digiarch';

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        const email = 'admin@digiarch.com';
        const password = 'admin123';
        const role = 'admin';

        // Check if user exists
        const existingUser = await mongoose.connection.db.collection('users').findOne({ email });

        if (existingUser) {
            console.log('ℹ️ Admin user already exists.');
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            await mongoose.connection.db.collection('users').insertOne({
                email,
                password: hashedPassword,
                role,
                __v: 0
            });
            console.log('✅ Admin user created: admin@digiarch.com / admin123');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

run();
