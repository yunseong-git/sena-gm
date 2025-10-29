import { IsMongoId } from 'class-validator';
export class TargetIdDto {
    @IsMongoId({ message: '유효하지 않은 대상 ID 형식입니다.' })
    targetId: string;
}