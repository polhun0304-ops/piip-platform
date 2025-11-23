# 베이스 이미지
FROM node:20

# Expo CLI 설치
RUN npm install -g expo-cli

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
# Ensure devDependencies (vite) are installed inside the image
RUN npm install --legacy-peer-deps --include=dev

# 소스 복사
COPY . .

# 포트 노출 (Expo DevTools)
EXPOSE 19000
EXPOSE 19001
EXPOSE 19006

# Expo 개발 서버 실행
CMD ["npx", "expo", "start", "--tunnel"]
