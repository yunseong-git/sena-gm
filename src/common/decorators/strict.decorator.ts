import { SetMetadata } from '@nestjs/common';

export const IS_STRICT_KEY = 'isStrict';

/**
 * Redis 상태 검사를 엄격하게 수행합. (Fail-Closed)
 * - Redis 장애 시 503 에러를 반환하여 요청을 차단.
 * - 사용처: 타인의 권한 변경, 추방 등 민감한 작업
 */
export const Strict = () => SetMetadata(IS_STRICT_KEY, true);