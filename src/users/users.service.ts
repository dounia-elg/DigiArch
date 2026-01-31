import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    create(userData) {
        return this.userModel.create(userData);
    }
}
