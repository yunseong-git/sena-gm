네, 그럼요. 지금까지 겪으신 전체 트러블슈팅 과정을 기술 블로그 포스트 형식에 맞게, 종결어미를 통일하여 정리해 드리겠습니다.

---
### ## NestJS 프로젝트: CommonJS에서 ESM으로의 전환기 - 트러블슈팅 전체 기록

이 문서는 `nanoid` 라이브러리 업데이트로 촉발된 `ERR_REQUIRE_ESM` 에러 해결을 시작으로, 기존 CommonJS(CJS) 기반 NestJS 프로젝트를 ES Modules(ESM) 방식으로 전환하는 과정에서 발생한 모든 문제점과 해결 방안을 순차적으로 기록함.

#### **배경**
* **프로젝트 환경**: NestJS, TypeScript, Mongoose
* **문제의 시작**: `nanoid` 최신 버전(v4+) 설치 후 `ERR_REQUIRE_ESM` 에러 발생
* **최종 목표**: 최신 라이브러리와의 호환성을 확보하고, 안정적으로 작동하는 ESM 기반의 프로젝트 아키텍처 구축

***
### **1. `nanoid` 호환성 에러 (`ERR_REQUIRE_ESM`)**

* **문제점**: `import { nanoid } from 'nanoid'` 구문이 TypeScript 컴파일 과정에서 `require('nanoid')`로 변환됨. 하지만 최신 `nanoid`는 ESM 전용 모듈이므로 CommonJS의 `require` 구문으로 호출이 불가능하여 에러 발생.
* **원인 분석**: 프로젝트의 모듈 시스템(CommonJS)과 라이브러리의 모듈 시스템(ESM) 간의 불일치.
* **해결 과정**:
    1.  **임시 해결**: `nanoid` 버전을 CommonJS를 지원하는 `v3`로 다운그레이드.
    2.  **근본적 해결**: 향후 발생할 유사한 문제를 원천적으로 차단하기 위해, 프로젝트 전체를 ESM 방식으로 전환하기로 결정.

***
### **2. ESM 전환 후 경로 해석 문제**

`package.json`에 `"type": "module"`을 추가하고 `tsconfig.json`을 수정하자, 다양한 경로 관련 에러가 발생함.

#### **2-1. 확장자 누락 에러**
* **문제점**: `import ... from './service'`와 같은 상대 경로 `import` 구문에서 모듈을 찾지 못하는 에러 발생.
* **원인 분석**: ESM은 CommonJS와 달리, `import` 경로에 **파일 확장자를 명시적으로 포함**할 것을 요구함. TypeScript 소스 코드에서는 컴파일 후의 확장자인 `.js`를 미리 명시해야 함.
* **해결 과정**: 프로젝트 내 모든 상대 경로 `import` 문 끝에 `.js` 확장자를 추가. (예: `from './service.js'`)

#### **2-2. 경로 별칭(Path Alias) 에러 (`ERR_PACKAGE_IMPORT_NOT_DEFINED`)**
* **문제점**: `import ... from 'src/...'` 또는 `#src/...`와 같은 절대 경로 별칭을 Node.js가 런타임에 해석하지 못하는 에러 발생.
* **원인 분석**: TypeScript는 `tsconfig.json`의 `paths` 설정을 통해 경로 별칭을 이해하지만, Node.js는 해당 설정을 알지 못하여 별칭을 `node_modules`에 있는 패키지 이름으로 착각함.
* **해결 과정**:
    1.  **시도 1 (`imports`)**: `package.json`의 `imports` 필드를 사용하여 Node.js에게 별칭을 알려주려 시도했으나, 다른 설정과 충돌하며 실패.
    2.  **시도 2 (`--loader`)**: `node --loader tsconfig-paths/register`를 사용하여 `tsconfig.json`의 `paths` 설정을 Node.js가 읽도록 시도했으나, Windows 환경의 불안정성으로 실패.
    3.  **최종 해결 (`tsc-alias`)**: 빌드 파이프라인에 '경로 번역' 단계를 추가.
        * `tsc`로 빌드하여 `dist` 폴더를 생성. (이 단계의 결과물에는 여전히 `#src/` 같은 별칭이 남아있음)
        * 빌드 후 `tsc-alias` 라이브러리를 실행하여 `dist` 폴더 내의 모든 별칭 경로를 `../` 같은 올바른 상대 경로로 **자동 변환**.
        * `package.json`의 `build` 스크립트를 `"build": "tsc -p tsconfig.json && tsc-alias"`로 수정하여 이 과정을 자동화.

***
### **3. 빌드(`build`) 실패 및 `dist` 폴더 미생성**

ESM 설정을 모두 마쳤음에도 `yarn build` 명령이 성공으로 출력되지만, 실제 `dist` 폴더가 생성되지 않는 문제가 발생.

* **원인 분석**:
    1.  `nest build` 명령어는 내부적으로 Webpack을 사용하려 하여 `tsconfig.json`의 ESM 설정을 무시함.
    2.  `tsconfig.build.json` 파일이 메인 `tsconfig.json`의 설정을 덮어쓰고 있었음.
* **해결 과정**:
    1.  `nest-cli.json`에서 빌더를 `"builder": "tsc"`로 명시하여 Webpack 사용을 중단.
    2.  혼란을 유발하는 `tsconfig.build.json` 파일을 삭제.
    3.  `package.json`의 `build` 스크립트를 `nest build` 대신 `tsc -p tsconfig.json`으로 직접 지정하여, `tsconfig.json`만을 신뢰하도록 변경.
    4.  빌드 전 이전 결과물을 확실히 지우기 위해 `build` 스크립트에 `rimraf dist`를 추가.

***
### **4. CommonJS 라이브러리 호환성 문제 (`ioredis`, `mongoose`)**

`import` 방식이 CommonJS 기반 라이브러리의 모듈 형식과 맞지 않아 에러 발생.

* **문제점**: `import { Connection } from 'mongoose'`와 같은 'Named Import' 구문이 ESM 환경에서 정상적으로 작동하지 않음.
* **원인 분석**: 해당 라이브러리들은 CommonJS 모듈이므로 ESM의 Named Export를 지원하지 않음. 모듈 전체를 가져온 뒤 필요한 부분을 꺼내 써야 함.
* **해결 과정**:
    * `import mongoose from 'mongoose'`로 변경 후, `mongoose.Connection`, `mongoose.Model`과 같이 접두사를 붙여 사용.
    * `import * as ioredis from 'ioredis'`로 변경 후, `new ioredis.Redis()`와 `ioredis.Redis` 타입으로 사용.

***
### **5. NestJS 의존성 주입(DI) 에러**

`UnknownDependenciesException` 에러가 반복적으로 발생하며, 서비스 간의 의존성 해결에 실패.

* **문제점**: `AuthService`가 `UserService`를 찾지 못하는 등, 모듈 간의 Provider 공유가 제대로 이루어지지 않음.
* **원인 분석**: `UserModule`과 `AuthModule` 간의 **순환 종속성(Circular Dependency)**이 근본 원인. `UserModule`이 `AuthGuard('jwt')`를 사용하기 위해 `AuthModule`을 `import`하려 했으나, 이는 `@nestjs/passport`의 내장 기능이므로 불필요한 의존성이었음.
* **해결 과정**:
    1.  **실패한 시도**: `@Global()` 데코레이터, `forwardRef`를 사용하여 순환 종속성을 해결하려 했으나, ESM 환경과의 충돌로 다른 문제를 야기하며 실패.
    2.  **최종 해결**: `UserModule`에서 불필요한 `AuthModule`에 대한 `import`를 제거하여 순환의 고리를 끊음. `AuthModule`이 `UserService`를 필요로 하므로, `AuthModule`에서 `UserModule`을 `import`하는 명확한 **단방향 의존성**을 확립.

***
### **6. 런타임 로직 버그 및 데이터 불일치**

모든 설정 문제가 해결된 후, 실제 API 테스트 과정에서 여러 논리적 버그 발견.

* **문제점 1 (Stale Token)**: DB를 수정한 후, 메모리에 있던 옛날 `user` 객체로 토큰을 재발급하여 `payload`가 최신화되지 않음.
* **해결**: `authService.issueTokens` 메서드 내부에서 항상 DB로부터 최신 유저 정보를 다시 조회하도록 로직 수정.
* **문제점 2 (Mongoose Reserved Field)**: User 스키마의 서브도큐먼트에 `_id`라는 예약어를 필드명으로 사용하여 데이터가 저장되지 않음.
* **해결**: 필드명을 `_id`에서 `guildId`로 변경하여 Mongoose와의 이름 충돌을 회피.
* **문제점 3 (`GuildGuard` Data Mismatch)**: `GuildGuard`가 리팩토링 이전의 데이터 구조(`user.guild_Id`)를 참조하여 정상적인 유저를 차단.
* **해결**: `user.guild.guildId`와 `user.guild.role`을 참조하도록 가드 로직을 현대화.
* **문제점 4 (`select: false` Field)**: 스키마에 `select: false`로 숨겨진 필드를 조회할 때 `.select('+code')`를 사용하지 않아 데이터를 가져오지 못함.
* **해결**: `QueryService`의 관련 메서드에서 `+` 접두사를 사용하여 숨겨진 필드를 명시적으로 조회하도록 수정.

---
### **결론**

단순한 라이브러리 호환성 문제에서 시작된 이 과정은, 프로젝트의 근간을 이루는 모듈 시스템 전체를 현대화하는 대규모 리팩토링으로 이어짐. 이 과정에서 TypeScript, Node.js, NestJS, Mongoose의 깊은 내부 동작 원리를 이해하고, 수많은 잠재적 버그를 해결하며 훨씬 더 안정적이고 확장성 있는 아키텍처를 구축하게 됨.