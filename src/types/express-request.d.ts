import { TestUserDocument } from '#src/schemas/test-user.schema.js';

declare module 'express' {
  interface Request {
    user?: TestUserDocument;
  }
}

/*
<Request 타입 확장하기>
req.user의 타입은 기본적으로 any 또는 Express.User
이 상태로는 우리가 정의한 user 타입 정보를 알 수 없음.
커스텀 데코레이터가 정확한 타입을 반환할 수 있게 Express.Request 타입을 확장
*/


//그렇다면 일반적으로 그냥 타입을 선언하는것과 뭐가 다르냐?