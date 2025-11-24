//commons
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

//schemas
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserGuildService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  /** * [트랜잭션용] 유저의 길드 정보 업데이트 
   * (길드 생성/가입/탈퇴/추방 시 호출)
   */
  async updateGuildInfo(
    userId: Types.ObjectId,
    updateData: { guildId: Types.ObjectId | null; guildRole: string | null },
    session: ClientSession
  ): Promise<void> {

    await this.userModel.updateOne(
      { _id: userId },
      { $set: updateData },
    ).session(session);
  }


}
