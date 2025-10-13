import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MyHero, TestUser, TestUserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AddOrUpdateHeroesDto, UpdateHeroEvoDto } from './dto/myheroes.dto';

@Injectable()
export class UserService {
  // 생성자에서 @InjectModel() 데코레이터를 사용해 User 모델을 주입받습니다.
  constructor(
    @InjectModel(TestUser.name) private userModel: Model<TestUserDocument>,
  ) { }

  /** 리프레시 토큰 저장 (해싱 적용) */
  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { currentRefreshToken: hashedRefreshToken } },
    );
  }


  /** 유저 검증 (ID/PW) */
  async validateUser(nickname: string, password: string): Promise<TestUserDocument | null> {
    const user = await this.userModel.findOne({ nickname });

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
  async getUserIfRefreshTokenMatches(userId: string, refreshToken: string): Promise<TestUserDocument | null> {
    //유저 검색
    const user = await this.userModel.findById(userId).select('+refreshToken');
    if (!user || !user.refreshToken) {
      return null;
    }

    // 클라이언트가 보낸 토큰과 DB에 저장된 토큰을 비교
    const isMatches = await bcrypt.compare(refreshToken, user.refreshToken);

    if (isMatches) {
      return user;
    } else {
      return null;
    }
  }

  async findUserById(userId: string): Promise<TestUserDocument | null> {
    return await this.userModel.findById(userId);
  }

  /**
    * @description 사용자의 보유 영웅 목록을 가져옵니다.
    */
  async getMyHeroes(userId: string): Promise<MyHero[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user.myHeroes || [];
  }

  /**
   * 내 영웅 일괄 수정(현재는 덮어쓰기만 적용 중)
   * 대안1 -> 
   */
  async addOrUpdateHeroes(userId: string, dto: AddOrUpdateHeroesDto): Promise<void> {

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    //hero_id 변환
    const heroesToSave: MyHero[] = dto.myHeroes.map(heroDto => ({
      ...heroDto,
      hero_Id: new Types.ObjectId(heroDto.hero_Id),
    }));

    user.myHeroes = heroesToSave;
    await user.save();
  }

  /**
   * @description 특정 영웅의 초월 정보 업데이트
   * @param user_Id 사용자 ID
   * @param updateEvoDto 업데이트할 영웅 초월 정보
   */
  async updateHeroEvolution(user_Id: string, dto: UpdateHeroEvoDto): Promise<void> {
    const heroObjectId = new Types.ObjectId(dto.hero_Id);

    /* < string -> objectId 타입변환에 대해 >
    프라이머리 키로 사용되는 objectId에 대해서는 mongoose가 기본 string을 objectId로 변환을 잘 시켜주지만
    지금 같은 임베디드 필드에서는 쿼리엔진이 타입을 더 엄격하게 잡음
    따라서 명시적인 변환이 필요함.
    */

    const result = await this.userModel.updateOne(
      { _id: user_Id, 'myHeroes.hero_Id': heroObjectId },
      { $set: { 'myHeroes.$.evolution': dto.evolution } },
    ).exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException('해당 영웅을 찾을 수 없습니다.');
    }
  }
}
