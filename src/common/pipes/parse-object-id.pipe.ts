import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

/**http 요청으로 컨트롤러로 들어오는 string을 object_Id로 변환용도 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string, metadata: ArgumentMetadata): Types.ObjectId {
    // 들어온 value가 유효한 ObjectId 형식인지 검증
    const isValid = Types.ObjectId.isValid(value);

    if (!isValid) {
      // 유효하지 않다면, 400 Bad Request 에러를 발생
      throw new BadRequestException('유효하지 않은 ID 형식입니다.');
    }

    //  유효하다면, 문자열을 Mongoose의 ObjectId 타입으로 변환하여 반환
    return new Types.ObjectId(value);
  }
}