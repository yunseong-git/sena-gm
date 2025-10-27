import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserGuildInfo, UserGuildInfoSchema } from './user-guild.schema.js';
import { MyHero, MyHeroSchema } from './user-heroes.schema.js';

// 유저의 역할을 정의하는 Enum. 확장성을 위해 배열로 관리합니다.
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true, collection: 'Users' })
export class User {
  // Google Ouath
  @Prop({ type: String, unique: true, sparse: true })
  googleId?: string;

  @Prop({ type: String })
  displayName?: string;

  // personal info
  @Prop({ required: true, type: String }) // unique 제거
  nickname: string;

  @Prop({ required: true, type: Number }) // tag 필드 추가
  tag: number;

  // only for test
  @Prop({ type: String, unique: true, sparse: true }) // 테스트용 ID 필드 (optional)
  testId?: string;

  @Prop({ type: String, select: false })
  password?: string; // 테스트용

  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER], select: false })
  roles: [UserRole];

  // refresh token
  @Prop({ select: false })
  currentHashedRefreshToken?: string;

  // guild info 
  @Prop({ type: UserGuildInfoSchema, _id: false })
  guild?: UserGuildInfo; // 길드가 없을 수 있으므로 optional

  // owned heroes info
  @Prop({ type: [MyHeroSchema], default: [] })
  myHeroes: MyHero[];

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ 'myHeroes.type': 1 });
UserSchema.index({ nickname: 1, tag: 1 }, { unique: true })