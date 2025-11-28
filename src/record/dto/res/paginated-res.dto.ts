import { ApiProperty } from "@nestjs/swagger";

// 제네릭을 사용하여 어떤 데이터든 담을 수 있게 만듦
export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[]; // 실제 데이터 목록

  @ApiProperty({
    example: { total: 100, page: 1, lastPage: 5, hasMore: true },
    description: '페이지네이션 메타 정보'
  })
  meta: {
    total: number;      // 전체 데이터 개수 (필터링 된 기준)
    page: number;       // 현재 페이지
    lastPage: number;   // 마지막 페이지 번호
    hasMore: boolean;   // 다음 페이지 존재 여부 (인피니트 스크롤용)
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      lastPage: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }
}