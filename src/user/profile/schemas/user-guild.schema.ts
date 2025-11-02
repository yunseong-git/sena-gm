import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { GuildRole } from '#src/guild/schemas/guild.schema.js';

@Schema({ _id: false })
export class UserGuildInfo {
    @Prop({ type: Types.ObjectId, ref: 'Guilds' })
    guildId: Types.ObjectId;

    @Prop()
    name: string;

    @Prop({ type: String, enum: GuildRole })
    role: string;
}

export const UserGuildInfoSchema = SchemaFactory.createForClass(UserGuildInfo);