//commons
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
//dtos
import { AddOrUpdateHeroesDto, AddOrUpdateRingsDto } from './dto/update-user-power.dto.js';

//schemas
import { UserPower, UserPowerDocument } from './schemas/user-power.schema.js';

@Injectable()
export class UserPowerService {
  constructor(
    @InjectModel(UserPower.name) private userPowerModel: Model<UserPowerDocument>,
  ) { }

  //유저 회원가입과 동시에 생성, hero는 heroservice 주입해서 가져오고, ring은 그냥 하드로 집어넣는다.
  async createUserPower(userId: Types.ObjectId): Promise<UserPowerDocument> {
    const createdUserPower = new this.userPowerModel({ userId });
    return createdUserPower.save();
  }

  async getMyPower(userId: Types.ObjectId): Promise<UserPowerDocument> {
    const userPower = await this.userPowerModel.findOne({ userId });
    if (!userPower) {
      throw new NotFoundException('사용자의 전투력 정보를 찾을 수 없습니다.');
    }
    return userPower;
  }

  // 'heroes'수정  : 배열 전체를 덮어쓰기
  async addOrUpdateHeroes(userId: Types.ObjectId, dto: AddOrUpdateHeroesDto): Promise<void> {
    const userPower = await this.getMyPower(userId);

    //'heroes' 필드에 DTO로 받은 새 배열을 통째로 할당
    userPower.heroes = dto.heroes;
    await userPower.save();
  }

  async addOrUpdateRings(userId: Types.ObjectId, dto: AddOrUpdateRingsDto): Promise<void> {

    const updateQuery = {};
    const conditions = {};

    // $inc 쿼리 동적 생성
    for (const ringId in dto.updates) {
      const countChange = dto.updates[ringId];
      const field = `rings.${ringId}`; // ex) "rings.ring_6s_immortal"

      updateQuery[field] = countChange;

      // 0 미만으로 떨어지지 않게 조건(condition) 추가
      if (countChange < 0) { // 감소시키는 경우에만
        // "현재 DB의 값이 뺄셈하는 값보다 크거나 같아야 함"
        conditions[field] = { $gte: Math.abs(countChange) };
      }
    }

    // 3. MongoDB에 업데이트 요청
    const result = await this.userPowerModel.updateOne(
      { userId, ...conditions }, // 1. 유저 ID + 감소 조건
      { $inc: updateQuery },      // 2. 증가/감소시킬 값들
      { upsert: true } // ❗ upsert: true - 혹시 'rings' 객체나 해당 'ringId'가 없으면 생성
    );

    // 4. (중요) 0 미만 조건 때문에 업데이트가 실패했는지 확인
    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      // 'userId'는 맞았는데 'conditions' (예: $gte) 때문에 실패한 경우
      throw new BadRequestException('보유한 반지의 개수가 부족합니다.');
    }
  }

}
