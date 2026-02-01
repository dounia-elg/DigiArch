const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const url = 'mongodb://localhost:27017';
const dbName = 'digiarch';

async function run() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log('📦 Connected to MongoDB');
        const db = client.db(dbName);
        const users = db.collection('users');

        const email = 'admin@digiarch.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            console.log('ℹ️ Admin user already exists.');
        } else {
            await users.insertOne({
                email,
                password: hashedPassword,
                role: 'admin',
                __v: 0
            });
            console.log('✅ Admin user created: admin@digiarch.com / admin123');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

run();
