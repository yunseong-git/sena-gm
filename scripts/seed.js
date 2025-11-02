const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
// .env 파일에서 환경 변수를 불러오기 위해 dotenv 패키지가 필요합니다.
require('dotenv').config();

// 1. 컴파일된 NestJS의 스키마 파일 경로
// (주의: 'dist' 폴더 기준입니다. 'src'가 아닙니다!)
// (만약 스키마 파일 경로가 다르면 이 부분을 수정해야 합니다.)
const { HeroSchema, Hero } = require('../dist/heroes/schemas/hero.schema');

// -------------------------------------------------

async function runSeed() {
  let connection;
  try {
    // 2. .env 파일의 DB 주소로 연결
    const dbUrl = process.env.MONGO_URI; // .env 파일에 MONGODB_URI=... 가 있어야 합니다.
    if (!dbUrl) {
      throw new Error('MONGODB_URI를 .env 파일에 설정해주세요.');
    }

    console.log('MongoDB에 연결 시도 중...');
    connection = await mongoose.connect(dbUrl);
    console.log('MongoDB 연결 성공.');

    // 3. Mongoose 모델 가져오기
    // NestJS의 MongooseModule.forFeature([{ name: Hero.name, schema: HeroSchema }])와 동일하게 설정
    const HeroModel = connection.model(Hero.name, HeroSchema);

    // 4. JSON 데이터 파일 읽기
    const jsonPath = path.join(__dirname, '../data/heroes-data.json');
    const heroesData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    if (!heroesData || heroesData.length === 0) {
      throw new Error('data/heroes-data.json 파일이 비어있거나 찾을 수 없습니다.');
    }

    console.log(`총 ${heroesData.length}개의 영웅 데이터를 시딩합니다...`);

    // 5. Upsert 실행 (핵심 로직)
    const promises = heroesData.map(hero => {
      const filter = { name: hero.name }; // 이름(name)을 기준으로
      const update = hero; // JSON 파일의 데이터로
      const options = {
        upsert: true, // 없으면 새로 생성 (Insert)
        new: true     // (선택) 업데이트된 문서를 반환
      };

      // findOneAndUpdate가 upsert를 처리해줍니다.
      return HeroModel.findOneAndUpdate(filter, update, options);
    });

    await Promise.all(promises);

    console.log(`성공: ${heroesData.length}개 영웅 데이터 처리 완료.`);

  } catch (error) {
    console.error('시딩 스크립트 오류 발생:', error.message);
  } finally {
    // 6. 연결 종료
    if (connection) {
      await connection.disconnect();
      console.log('MongoDB 연결 종료.');
    }
    process.exit();
  }
}
// 스크립트 실행
runSeed();