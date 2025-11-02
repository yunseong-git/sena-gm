//commons
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

//schemas
import { User, UserDocument } from './schemas/user.schema.js';
import { CreateUserDto } from './dto/user.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  //only dev
  async createUser(dto: CreateUserDto) {
    const tag = await this.findUniqueTag(dto.nickname);

    const createdUser = new this.userModel({ nickname: dto.nickname, tag: tag, testId: dto.testId, password: dto.password });
    return createdUser.save();
  }

  private async findUniqueTag(nickname: string, maxRetries = 5): Promise<number> {
    for (let i = 0; i < maxRetries; i++) {
      const randomTag = Math.floor(1000 + Math.random() * 9000); // 1000 ~ 9999
      const exists = await this.userModel.exists({ nickname, tag: randomTag });
      if (!exists) {
        return randomTag;
      }
    }
    throw new ConflictException('닉네임에 대한 고유 태그 생성에 실패했습니다. 다른 닉네임을 시도해주세요.');
  }

  /** 리프레시 토큰 저장 (해싱 적용) */
  async saveRefreshToken(userId: Types.ObjectId, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { currentHashedRefreshToken: hashedRefreshToken } },
    );
  }

  /** 유저 검증 (ID/PW) */
  async validateUser(testId: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ testId: testId });

    // 비밀번호 해싱을 사용하지 않으므로 직접 비교
    if (user && user.password === password) {
      return user;
    }
    return null;
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

  async getUserProfil(userId: Types.ObjectId): Promise<UserDocument> {
    const result = await this.userModel.findById(userId).select('nickname tag');
    if (!result) throw new NotFoundException('사용자를 찾을 수 없습니다.')
    return result;
  }
}
