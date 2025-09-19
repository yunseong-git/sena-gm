import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// 유저의 역할을 정의하는 Enum. 확장성을 위해 배열로 관리합니다.
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

//테스트용
@Schema({ timestamps: true, collection: 'TestUsers' })
export class TestUser {
  @Prop({ required: true, unique: true, type: String })
  nickname: string;

  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER] })
  roles: [UserRole];

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Guilds' })
  guild_Id: string;

  // 보유한 영웅
  @Prop({ type: Types.ObjectId, ref: 'Heroes' })
  myHeroes: [Types.ObjectId];
}

export type TestUserDocument = HydratedDocument<TestUser>;
export const TestUserSchema = SchemaFactory.createForClass(TestUser);

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
