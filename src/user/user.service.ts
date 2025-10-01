import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MyHero, TestUser, TestUserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { AddOrUpdateHeroesDto, UpdateHeroEvoDto } from './dto/myheroes.dto';

@Injectable()
export class UserService {
  // 생성자에서 @InjectModel() 데코레이터를 사용해 User 모델을 주입받습니다.
  constructor(
    @InjectModel(TestUser.name) private userModel: Model<TestUserDocument>,
  ) { }

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
