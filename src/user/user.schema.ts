import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserGuildInfo, UserGuildInfoSchema } from './profile/schemas/user-guild.schema.js';
import { GUILD_ROLE_ENUM } from '#src/guild/schemas/guild.schema.js';

// 유저의 역할을 정의하는 Enum. 확장성을 위해 배열로 관리합니다.
export enum User_Role_Enum {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema({ timestamps: true, collection: 'users', toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User {
  // --- Google OAuth ---
  @Prop({ type: String, unique: true, sparse: true })
  googleId?: string;

  @Prop({ type: String, unique: true, sparse: true })
  email?: string;

  // --- personal info ---
  @Prop({ required: true, type: String })
  nickname: string;

  @Prop({ required: true, type: Number })
  tag: number;

  get fullNickname(): string {
    return `${this.nickname}#${this.tag.toString().padStart(4, '0')}`;
  }

  @Prop({ type: String, enum: User_Role_Enum, required: true, default: User_Role_Enum.USER })
  role: User_Role_Enum;

  // --- Guild Info --- 
  @Prop({ type: Types.ObjectId, ref: 'Guild' })
  guildId?: Types.ObjectId;

  @Prop({ type: String, enum: GUILD_ROLE_ENUM })
  guildRole?: GUILD_ROLE_ENUM

  // --- Security ---
  @Prop({ select: false })
  currentHashedRefreshToken?: string;

  // --- State ---
  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isDeleted: boolean;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

// --- indexes ---
UserSchema.index({ nickname: 1, tag: 1 }, { unique: true })

// --- virtual fields ---
UserSchema.virtual('fullNickname').get(function (this: User) {
  return `${this.nickname}#${this.tag.toString().padStart(4, '0')}`;
});