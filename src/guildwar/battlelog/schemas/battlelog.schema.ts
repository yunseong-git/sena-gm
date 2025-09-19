import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true , collection: 'BattleLogs'})
export class BattleLog {
    @Prop({ required: true, type: Types.ObjectId, ref: 'Sessions' })
    session_Id: Types.ObjectId; //길드전 세션id

    @Prop({ required: true, type: Types.ObjectId, ref: 'Castle' })
    castle_Id: Types.ObjectId; //공격한 성 

    @Prop({ required: true, type: Types.ObjectId, ref: 'Shild' })
    Defense_Team_Id: Types.ObjectId; //공격한 방어팀

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    attacker_Id: Types.ObjectId; //공격한 길드원 

    @Prop({ required: true, type: Types.ObjectId, ref: 'BattleLog' })
    attackBattleLog_Id: Types.ObjectId; //공격에 사용한 덱

    @Prop({ required: true, enum: ['WIN', 'LOSS'] })
    result: string; // 전투 결과

    @Prop()
    memo?: string; // 공략 메모
}

export type BattleLogDocument = HydratedDocument<BattleLog>;
export const BattleLogSchema = SchemaFactory.createForClass(BattleLog);