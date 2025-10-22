import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GuildRole } from '#src/guild/schemas/guild.schema.js';
import { HeroType } from '#src/hero/schemas/hero.schema.js';

// 유저의 역할을 정의하는 Enum. 확장성을 위해 배열로 관리합니다.
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ _id: false })
export class MyHero {
  @Prop({ type: Types.ObjectId, ref: 'Heroes', required: true })
  hero_Id: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String, enum: HeroType })
  type: string;

  // Hero 콜렉션에는 없는 유저별 고유 정보 (0~12)
  @Prop({ required: true, type: Number, default: 0 })
  evolution: number;
}

const MyHeroSchema = SchemaFactory.createForClass(MyHero);

@Schema({ _id: false })
class UserGuildInfo { //굳이 export 안함.
  @Prop({ type: Types.ObjectId, ref: 'Guilds' })
  guildId: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ type: String, enum: GuildRole })
  role: string;
}

//테스트용
@Schema({ timestamps: true, collection: 'TestUsers' })
export class TestUser {
  @Prop({ required: true, unique: true, type: String })
  nickname: string;

  @Prop({ required: true, type: String, select: false })
  password: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER], select: false })
  roles: [UserRole];

  // 길드 정보를 하나의 객체로 묶어서 관리
  @Prop({ type: UserGuildInfo, _id: false })
  guild?: UserGuildInfo; // 길드가 없을 수 있으므로 optional

  // 보유한 영웅정보
  @Prop({ type: [MyHeroSchema], default: [] })
  myHeroes: MyHero[];

  @Prop({ select: false }) // 보안을 위해 조회 시 기본적으로 제외
  refreshToken?: string;

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export type TestUserDocument = HydratedDocument<TestUser>;
export const TestUserSchema = SchemaFactory.createForClass(TestUser);

TestUserSchema.index({ 'myHeroes.type': 1 });

/* 추후 실제 배포 용도
@Schema({ timestamps: true, })
export class User {
    // Google이 제공하는 사용자의 고유 ID. 기본 키 역할을 합니다.
    @Prop({ required: true, unique: true, type: String })
    googleId: string;

    // 구글 이메일
    @Prop({ required: true, unique: true, type: String })
    email: string;

    // 구글 계정이름
    @Prop({ required: true, type: String })
    name: string;

    //서비스 내의 닉네임
    @Prop({ required: true, unique: true, type: String })
    nickname: string;

    @Prop({ type: [String], enum: UserRole, default: [UserRole.USER] })
    roles: UserRole[];

    @Prop({ type: Date })
    lastLoginAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'Guild' })
    guild_Name: string;

    // 보유한 영웅(뜬금없긴 하지만 게임에선 필수적으로 등록해야함)
    @Prop({ required: true, type: Types.ObjectId, ref: 'Hero' })
    myHeroes: [Types.ObjectId];
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

*/
