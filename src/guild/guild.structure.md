## controller설계 중점.
- 누가, 누구에게 영향을 미치는가?" 그리고 "Redis가 죽었을 때 막아야 하는가?"를 기준

1. GuildPublicController
- 역할: 길드 생성, 가입 (아직 길드원이 아닌 상태)
- 전략: Redis 불필요. (성공 시 응답 쿠키로 토큰 교체)

2. GuildMemberController
- 역할: 조회, 탈퇴, 해산(본인 결정)
- 전략: Fail-Open (유연함) : Redis가 죽어도 서비스는 계속, 대신 Service 로직 최상단에서 DB 검증(fail-fast)을 꼼꼼하게 수행

3. GuildManageController
- 역할: 권한 변경, 추방, 공지 수정 (관리자 권한)
- 전략: Fail-Closed (엄격함) : 타인의 권한을 건드리는 작업은 데이터 정합성이 최우선, Redis가 죽으면 "안전하게 차단(503)", 대신 서비스 로직에서 클라이언트 토큰을 100% 신뢰


## Service 설계 중점
- "어떤 데이터를 건드리는가?" (기능/도메인 기준)

1. GuildLifecycleService
- 길드의 생성과 삭제에 관여 -> 생성(create), 해산(dismiss)

2. GuildMembershipService
- members 배열의 변경 -> 가입(join), 탈퇴(leave), 추방(kick)

3. GuildRoleService
- 길드원의 권한 변경 -> 마스터위임, 매니저임명 (setRole)

4. GuildResourceService
- 길드 내부 리소스 변경 -> 공지, 코드, 태그 등 설정 (update)

5. GuildQueryService
- 길드 쿼리

