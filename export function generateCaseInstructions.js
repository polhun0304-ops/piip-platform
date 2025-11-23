export function generateCaseInstructions(caseData) {
  const {
    caseCode,
    caseType,
    priority = "normal",
    sensitivity = "standard",
    legalContext,
    paymentStatus,
    assignedTeam = [],
    scope = {},
  } = caseData;

  const title = caseCode
    ? `${caseCode} ${caseType} 사건 조사 지침`
    : `${caseType} 사건 조사 지침`;
  let instructions = `# ${title}\n\n`;

  instructions += appendPrioritySection(priority);
  instructions += appendSecuritySection(sensitivity);
  instructions += appendComplianceSection(legalContext);
  instructions += appendScopeSection(scope);
  instructions += appendOperationalNotes(paymentStatus, assignedTeam);
  instructions += `## ${caseType} 특화 가이드\n`;
  instructions += getCaseTypeSpecificGuidelines(caseType);

  return instructions.trim() + "\n";
}

function appendPrioritySection(priority) {
  const map = {
    urgent: [
      "- **12시간 이내** 초기 보고서 제출",
      "- 핵심 증거 우선 확보 후 체인 오브 커스터디 등록 확인",
      "- 담당 관리자 및 의뢰인에게 실시간 상태 업데이트",
      "- 중복 업무 방지를 위해 작업 로그 즉시 기록",
    ],
    high: [
      "- **24시간 이내** 1차 분석 보고서 작성",
      "- 증거 분류 및 OCR 분석 선행",
      "- 주요 이해관계자 연락 루틴 확보",
    ],
    normal: [
      "- 주간 진행 체크인 미팅 포함",
      "- 증거 업로드 후 48시간 내 검토 완료",
      "- 추가 자료 요청 시 SLA 24시간 준수",
    ],
    low: ["- 정기 모니터링 위주 진행", "- 일정 변경 시 관리자 승인 필수"],
  };

  const items = map[priority] || map.normal;
  return ["## 우선순위 프로토콜", ...items].join("\n") + "\n\n";
}

function appendSecuritySection(sensitivity) {
  const map = {
    critical: [
      "- 모든 통신은 엔드투엔드 암호화 채널 사용",
      "- 민감 데이터는 View-once 도구 또는 오프라인 금고 보관",
      "- 접근 권한 최소화(Need-to-know)",
      "- 일일 보안 체커: 접근 로그, 체인 로그, 감사 로그 검토",
    ],
    high: [
      "- 민감 정보는 자동 마스킹 처리 후 공유",
      "- 파일 업로드 시 해시 검증 및 중복 검사",
      "- 원본 증거는 암호화 저장소에 저장",
    ],
    standard: [
      "- 플랫폼 내 안전 채널을 통한 문서 공유",
      "- 필요 시 2차 인증(OTP) 요구",
    ],
    low: ["- 표준 보안 프로토콜 적용", "- 불필요한 개인정보 수집 금지"],
  };
  const items = map[sensitivity] || map.standard;
  return ["## 보안 프로토콜", ...items].join("\n") + "\n\n";
}

function appendComplianceSection(legalContext) {
  if (!legalContext) return "";

  const {
    jurisdiction = "KR",
    applicableLaws = [],
    requiresLegalReview,
  } = legalContext;
  const section = [
    "## 법적·컴플라이언스 고려사항",
    `- 관할: ${jurisdiction}`,
    applicableLaws.length
      ? `- 준수 법령: ${applicableLaws.join(", ")}`
      : "- 준수 법령: 내부 표준 컴플라이언스 가이드",
    "- 증거 수집 및 인터뷰 시 적법 절차(CSA/디지털 증거법 등)를 준수",
    requiresLegalReview
      ? "- **법률 자문 필수**: 보고서 제출 전 법무팀 검토 요청"
      : "- 필요 시 법무팀 사전 연락 후 진행",
    "- 개인정보 처리방침(PIIP-PRV-001)과 결제 보안 규정(PIIP-PAY-002) 준수 확인",
  ];

  return section.join("\n") + "\n\n";
}

function appendScopeSection(scope) {
  if (!scope || Object.keys(scope).length === 0) return "";

  const lines = ["## 조사 범위 및 예외"];
  if (scope.included) lines.push(`- 포함 범위: ${scope.included.join(", ")}`);
  if (scope.excluded) lines.push(`- 제외 범위: ${scope.excluded.join(", ")}`);
  if (scope.deadlines) lines.push(`- 마감 일정: ${scope.deadlines.join(", ")}`);
  if (scope.notes) lines.push(`- 비고: ${scope.notes}`);
  return lines.join("\n") + "\n\n";
}

function appendOperationalNotes(paymentStatus, assignedTeam) {
  const info = [];

  if (paymentStatus) {
    info.push("## 운영 메모");
    info.push(
      paymentStatus === "pending"
        ? "- 결제 대기: 보고서 제출 전 결제 확인 필요"
        : "- 결제 상태: 정산 완료"
    );
  }

  if (assignedTeam?.length) {
    if (!info.length) info.push("## 운영 메모");
    const teamList = assignedTeam.map(
      (member) =>
        `   - ${member.role ?? "담당"}: ${member.name ?? member.id ?? "미배정"}`
    );
    info.push("- 담당 팀 구성:");
    info.push(...teamList);
  }

  return info.length ? info.join("\n") + "\n\n" : "";
}

function getCaseTypeSpecificGuidelines(caseType) {
  const guidelines = {
    fraud: `
- 금융 거래 내역, 계좌 추적 로그 확보
- 계약서, 세금계산서 등 문서 위·변조 여부 검증
- 내부 공모 가능성 평가(직원 인터뷰 포함)
- 재발 방지 권고안 초안 작성
    `,
    cyber_intrusion: `
- 서버/클라우드 접근 로그 즉시 백업 및 분석
- 침해 지표(IOC) 수집 후 탐지 규칙 업데이트
- 외부 위협 인텔리전스 공유 필요 여부 확인
- 법적 신고 의무(통신비밀보호법, 전자금융거래법) 검토
    `,
    missing_person: `
- 최종 목격 시각과 위치 기반 CCTV/교통 기록 수집
- 통신/결제 데이터 분석 후 동선 추정
- 지인 네트워크 인터뷰 일정 수립(동의서 확보)
- 경찰 등 공공기관 협업 채널 사전 확보
    `,
    corporate: `
- 내부 규정/윤리 정책 준수 여부 점검
- 이해관계자 인터뷰 시 공식 절차 및 기록 유지
- 재무/IT 시스템 감사 로그 확보
- PR 리스크 평가 및 관리자 보고 형식 준비
    `,
    domestic_dispute: `
- 개인 정보 민감도 높음: 의뢰인/대상자 분리 보안 유지
- 증거 수집 시 법적 허용 범위(주거침입/비밀녹음 등) 재확인
- 상담/법률 지원 연결 옵션 제시
- 감정 격화 방지 커뮤니케이션 가이드 별첨
    `,
  };

  return (
    guidelines[caseType] ||
    "- 표준 조사 프로토콜(PIIP-INT-BASE)을 적용하고, 특이 사항 발생 시 관리자에게 즉시 보고합니다.\n"
  );
}
