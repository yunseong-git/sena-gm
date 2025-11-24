//commons
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

//schemas
import { User, User_Role_Enum, UserDocument } from '../schemas/user.schema';
import { CreateGoogleUserDto } from '../dto/req/create-user.dto';
import { Counter, CounterDocument } from '../../common/schemas/counter.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) { }

  async createGoogleUser(dto: CreateGoogleUserDto) {
    // --- counter ---
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'user_tag' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const tag = counter.seq;

    // --- feat.user ---
    const userInfo = {
      googleId: dto.googleId,
      nickname: dto.nickname,
      tag: tag.toString(),
      email: dto.email,
      role: User_Role_Enum.USER,
    }
    const newUser = await this.userModel.create({ userInfo });
    return newUser;
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ googleId: googleId });
  }

  /** 리프레시 토큰 저장 (해싱 적용) */
  async saveRefreshToken(userId: Types.ObjectId, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { currentHashedRefreshToken: hashedRefreshToken } },
    );
  }


  /** 리프레시 토큰 검증 및 유저 반환
   * 모든 과정 통과시 user객체 반환
   * 유저없거나, 토큰불일치 시 null
   */
  async getUserIfRefreshTokenMatches(userId: string, refreshToken: string): Promise<UserDocument | null> {
    //유저 검색
    const user = await this.userModel.findById(userId).select('+currentHashedRefreshToken');
    if (!user || !user.currentHashedRefreshToken) {
      return null;
    }

    // 클라이언트가 보낸 토큰과 DB에 저장된 토큰을 비교
    const isMatches = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);

    if (isMatches) {
      return user;
    } else {
      return null;
    }
  }

  async removeRefreshToken(userId: Types.ObjectId): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $unset: { currentHashedRefreshToken: "" } } // ""는 $unset 연산자 문법
    );
  }

  async findById(id: Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }
    return user;
  }
}
