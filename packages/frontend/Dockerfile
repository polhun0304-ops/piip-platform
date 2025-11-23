# 베이스 이미지
FROM node:20

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
# Ensure devDependencies (vite) are installed inside the image
RUN npm install --legacy-peer-deps --include=dev

# 소스 복사
COPY . .

# 포트 노출 (Vite 기본 포트)
EXPOSE 5173

# 개발 서버 실행
CMD ["npm", "run", "dev"]
