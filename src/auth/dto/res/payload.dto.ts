import { JwtPayload, UserPayload } from "#src/auth/interfaces/token-payload.interface.js";
import { User_Role_Enum } from "#src/user/user.schema.js";
import { ApiProperty } from "@nestjs/swagger";
import { ObjectId, Types } from "mongoose";

export class JwtPayloadDto implements JwtPayload {
  @ApiProperty({ description: '유저 ID' })
  sub: string;

  @ApiProperty({ description: '유저 역할', enum: User_Role_Enum, example: User_Role_Enum.USER })
  userRole: User_Role_Enum;

  @ApiProperty({ description: '길드 ID', nullable: true, example: '...' })
  guildId: string | null;

  @ApiProperty({ description: '길드 내 역할', nullable: true, example: 'master' })
  guildRole: string | null;
}

export class UserPayloadDto implements UserPayload {
  @ApiProperty({ description: '유저 ID' })
  id: Types.ObjectId;

  @ApiProperty({ description: '유저 역할', enum: User_Role_Enum, example: User_Role_Enum.USER })
  userRole: User_Role_Enum;

  @ApiProperty({ description: '길드 ID', nullable: true, example: '...' })
  guildId: Types.ObjectId | null;

  @ApiProperty({ description: '길드 내 역할', nullable: true, example: 'master' })
  guildRole: string | null;
}