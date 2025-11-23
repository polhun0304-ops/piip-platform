# 베이스 이미지
FROM node:20

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
# npm 최신 버전에서 devDependencies가 생략될 수 있어 명시적으로 dev 의존성 포함
RUN npm install --legacy-peer-deps --include=dev

# 소스 복사
COPY . .

# 포트 노출
EXPOSE 5001

# 개발 서버 실행
CMD ["npm", "run", "dev"]
