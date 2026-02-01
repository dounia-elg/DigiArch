import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    create(userData) {
        return this.userModel.create(userData);
    }

    findAll() {
        return this.userModel.find().select('-password').exec();
    }

    async findById(id: string) {
        const user = await this.userModel.findById(id).select('-password').exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.email) {
            user.email = updateUserDto.email;
        }

        if (updateUserDto.password) {
            user.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        if (updateUserDto.role) {
            user.role = updateUserDto.role;
        }

        await user.save();
        const { password, ...result } = user.toObject();
        return result;
    }

    async delete(id: string) {
        const user = await this.userModel.findByIdAndDelete(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return { message: 'User deleted successfully' };
    }
}
