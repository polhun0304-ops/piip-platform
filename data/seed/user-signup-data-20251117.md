# 📊 data/seed/

이 폴더는 MongoDB Compass 또는 초기 데이터 삽입용 JSON 파일을 저장합니다.

## 파일 목록

- `user-signup-data-20251117.json`: changhoon 사용자의 전체 회원가입 정보가 포함된 JSON 파일

## 사용 방법

MongoDB Compass에서 `Import Data` → `JSON` 선택 후 해당 파일을 불러오면 됩니다.

## 필드 설명

- `residentId`: 암호화된 주민등록번호
- `detective`: 탐정 자격 정보 (자격 여부, 번호, 발급일, 만료일, 발급기관, 자격증 파일)
- `activityLog`: 사용자 활동 기록
- `preferences`, `tags`, `address`: 사용자 설정 및 분류 정보
