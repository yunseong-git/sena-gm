import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateMyHeroesDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TestUser, TestUserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  // 생성자에서 @InjectModel() 데코레이터를 사용해 User 모델을 주입받습니다.
  constructor(
    @InjectModel(TestUser.name) private userModel: Model<TestUserDocument>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const createdUser = new this.userModel(dto);
    return createdUser.save();
  }

  async UpdateMyHeroes(dto: UpdateMyHeroesDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      dto.user_id,
      { myHeroes: dto.heroes },
      { new: true }, // 업데이트된 후의 문서를 반환
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID #${dto.user_id} not found`);
    }

    return updatedUser;
  }

  async findAll(): Promise<TestUser[]> {
    return this.userModel.find().exec();
  }
}
