/**
 * Winston 기반 로깅 설정 파일
 * - 콘솔 출력
 * - 날짜별 로그 파일 저장
 * - 고정 로그 파일 저장
 * - JSON 형식 로그
 * - 사용자 ID 포함
 * - 오래된 로그 자동 삭제 (100일 경과 시)
 */
declare const logger: import("winston").Logger;
export default logger;
