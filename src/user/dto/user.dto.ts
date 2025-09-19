export class CreateUserDto {
  nickname: string;
}

export class UpdateMyHeroesDto {
  user_id: string;
  heroes: string[];
}

/*
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
  @Prop({ required: true, type: Types.ObjectId, ref: 'Heroes' })
  myHeroes: [Types.ObjectId];
}
*/
