import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '#src/user/profile/schemas/user.schema.js';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, UserPayload } from '../types/payload.type.js';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {
    const key = configService.get<string>('JWT_SECRET');
    if (!key) throw new Error('JWT_SECRET is not defined')
    super({
      jwtFromRequest: (req: Request) => req.cookies?.accessToken,
      secretOrKey: key,
      ignoreExpiration: false,
    });
  }

  /**JwtPayload -> UserPayload */
  async validate(payload: JwtPayload): Promise<UserPayload> {
    return {
      id: new Types.ObjectId(payload.sub),
      userRole: payload.userRole,
      guildId: payload.guildId ? new Types.ObjectId(payload.guildId) : null,
      guildRole: payload.guildRole,
    };
  }
}

