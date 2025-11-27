// ... imports
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateTestUserDto, LoginTestUserDto } from '../test-auth.dto';
import { Counter, CounterDocument } from '../../common/schemas/counter.schema';

@Injectable()
export class UserTestService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) { }

  /** [Test] 테스트 유저 생성 */
  async createTestUser(dto: CreateTestUserDto): Promise<UserDocument> {
    // 1. 태그 번호표 뽑기
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'user_tag' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const tag = counter.seq.toString().padStart(4, '0'); // 문자열로 저장 (스키마 변경됨)

    // 2. 유저 생성 (비밀번호 그대로 저장)
    const newUser = await this.userModel.create({
      nickname: dto.nickname,
      password: dto.password, // 해싱 안 함 (테스트용)
      tag,
      role: 'user',
    });

    return newUser;
  }

  /** [Test] 테스트 유저 검증 (로그인용) */
  async validateTestUser(dto: LoginTestUserDto): Promise<UserDocument> {
    // 닉네임으로 찾기 (태그 없이 닉네임만으로 로그인한다고 가정)
    // 동명이인이 있다면? -> 테스트니까 그냥 첫 번째 사람으로 로그인시킴 (단순화)
    const user = await this.userModel.findOne({ nickname: dto.nickname });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('닉네임 또는 비밀번호가 틀렸습니다.');
    }

    return user;
  }
}