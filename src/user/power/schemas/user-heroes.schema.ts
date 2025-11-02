import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class UserHero {
    @Prop({ type: Types.ObjectId, ref: 'Heroes', required: true })
    hero_Id: Types.ObjectId;

    @Prop({ required: true, type: String })
    name: string;

    // Hero 콜렉션에는 없는 유저별 고유 정보 (0~12)
    @Prop({ required: true, type: Number, default: 0 })
    evolution: number;
}

export const UserHeroSchema = SchemaFactory.createForClass(UserHero);