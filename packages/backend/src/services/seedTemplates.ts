import { AppDataSource } from "../config/database";
import { RequestTemplate } from "../entities/RequestTemplate";

/**
 * 표준 의뢰 템플릿 시드 데이터
 */
export async function seedRequestTemplates() {
  const repo = AppDataSource.getRepository(RequestTemplate);

  const templates = [
    {
      name: "불륜조사",
      description:
        "배우자 또는 연인의 외도/불륜 여부를 확인하고 증거를 수집하는 조사입니다.",
      sortOrder: 1,
      fields: [
        {
          key: "targetName",
          label: "조사대상자 이름",
          type: "text",
          required: true,
          placeholder: "예: 홍길동",
          aiPrompt: "조사 대상이 되는 사람의 이름",
        },
        {
          key: "targetPhone",
          label: "조사대상자 전화번호",
          type: "phone",
          required: false,
          placeholder: "010-1234-5678",
          aiPrompt: "조사 대상의 연락처",
        },
        {
          key: "relationship",
          label: "대상과의 관계",
          type: "select",
          required: true,
          options: ["배우자", "연인", "약혼자", "기타"],
          aiPrompt: "의뢰인과 조사 대상의 관계",
        },
        {
          key: "suspectedPerson",
          label: "의심되는 상대방 정보",
          type: "textarea",
          required: false,
          placeholder: "이름, 직장, 특징 등",
          aiPrompt: "불륜 상대방으로 의심되는 사람에 대한 정보",
        },
        {
          key: "suspicionReason",
          label: "의심하게 된 이유",
          type: "textarea",
          required: true,
          placeholder: "예: 최근 늦게 귀가, 스마트폰 보호, 태도 변화 등",
          aiPrompt: "불륜을 의심하게 된 구체적인 사유",
        },
        {
          key: "targetSchedule",
          label: "조사대상자 일정",
          type: "textarea",
          required: false,
          placeholder: "출근 시간, 퇴근 시간, 주말 활동 등",
          aiPrompt: "대상의 평소 일과나 스케줄",
        },
        {
          key: "preferredDate",
          label: "조사 희망 시작일",
          type: "date",
          required: false,
          aiPrompt: "조사를 시작하고 싶은 날짜",
        },
        {
          key: "clientContact",
          label: "의뢰인 연락처",
          type: "phone",
          required: true,
          placeholder: "010-9876-5432",
          aiPrompt: "의뢰인의 전화번호",
        },
        {
          key: "additionalInfo",
          label: "추가 정보",
          type: "textarea",
          required: false,
          placeholder: "기타 참고할 사항",
          aiPrompt: "그 외 조사에 도움이 될 정보",
        },
      ],
      conversationFlow: [
        {
          step: 1,
          message:
            "불륜조사 의뢰를 시작하겠습니다. 먼저, 조사 대상자의 성함을 알려주시겠어요?",
          expectedFields: ["targetName"],
        },
        {
          step: 2,
          message:
            "조사 대상자와는 어떤 관계이신가요? (배우자, 연인, 약혼자 등)",
          expectedFields: ["relationship"],
        },
        {
          step: 3,
          message:
            "불륜을 의심하게 된 구체적인 이유나 상황을 설명해 주시겠어요?",
          expectedFields: ["suspicionReason"],
        },
        {
          step: 4,
          message:
            "의심되는 상대방이 있으신가요? 있다면 이름이나 특징을 알려주세요. (선택사항)",
          expectedFields: ["suspectedPerson"],
        },
        {
          step: 5,
          message:
            "조사 대상자의 평소 일정(출퇴근 시간, 주말 활동 등)을 알려주시면 조사에 도움이 됩니다.",
          expectedFields: ["targetSchedule", "targetPhone"],
        },
        {
          step: 6,
          message:
            "마지막으로 의뢰인님의 연락처를 남겨주세요. 담당 탐정이 연락드리겠습니다.",
          expectedFields: ["clientContact"],
        },
      ],
    },
    {
      name: "소재파악",
      description:
        "연락이 두절된 사람, 채무자, 가족 등의 현재 위치와 연락처를 찾는 조사입니다.",
      sortOrder: 2,
      fields: [
        {
          key: "targetName",
          label: "찾으려는 사람 이름",
          type: "text",
          required: true,
          placeholder: "예: 김철수",
          aiPrompt: "소재를 파악하려는 대상의 이름",
        },
        {
          key: "targetBirthYear",
          label: "생년월일 또는 나이",
          type: "text",
          required: false,
          placeholder: "예: 1980년생, 만 43세",
          aiPrompt: "대상의 생년월일 또는 나이",
        },
        {
          key: "lastKnownAddress",
          label: "마지막으로 알려진 주소",
          type: "textarea",
          required: false,
          placeholder: "예: 서울시 강남구 역삼동",
          aiPrompt: "대상이 마지막으로 거주하거나 목격된 주소",
        },
        {
          key: "lastContact",
          label: "마지막 연락 시점",
          type: "text",
          required: false,
          placeholder: "예: 2024년 10월",
          aiPrompt: "대상과 마지막으로 연락한 시점",
        },
        {
          key: "relationship",
          label: "대상과의 관계",
          type: "select",
          required: true,
          options: ["가족", "친구", "채무 관계", "업무 관계", "기타"],
          aiPrompt: "의뢰인과 대상의 관계",
        },
        {
          key: "findReason",
          label: "찾으려는 이유",
          type: "textarea",
          required: true,
          placeholder: "예: 빌려준 돈 상환 요청, 가족 재회 등",
          aiPrompt: "소재 파악이 필요한 사유",
        },
        {
          key: "knownInfo",
          label: "알고 있는 정보",
          type: "textarea",
          required: false,
          placeholder: "직장, 차량, 지인 정보 등",
          aiPrompt: "대상에 대해 알고 있는 모든 정보",
        },
        {
          key: "clientContact",
          label: "의뢰인 연락처",
          type: "phone",
          required: true,
          placeholder: "010-1111-2222",
          aiPrompt: "의뢰인의 전화번호",
        },
      ],
      conversationFlow: [
        {
          step: 1,
          message:
            "소재파악 의뢰를 도와드리겠습니다. 찾으려는 분의 성함이 어떻게 되시나요?",
          expectedFields: ["targetName"],
        },
        {
          step: 2,
          message: "그분과는 어떤 관계이신가요?",
          expectedFields: ["relationship"],
        },
        {
          step: 3,
          message: "소재를 파악하려는 이유를 간단히 말씀해 주세요.",
          expectedFields: ["findReason"],
        },
        {
          step: 4,
          message: "마지막으로 연락하거나 목격한 시기와 장소를 알려주시겠어요?",
          expectedFields: ["lastContact", "lastKnownAddress"],
        },
        {
          step: 5,
          message:
            "그분에 대해 알고 계신 정보(직장, 차량, 지인 등)가 있으면 모두 알려주세요.",
          expectedFields: ["knownInfo", "targetBirthYear"],
        },
        {
          step: 6,
          message: "의뢰인님의 연락처를 남겨주세요.",
          expectedFields: ["clientContact"],
        },
      ],
    },
    {
      name: "신원조사",
      description:
        "결혼 예정자, 사업 파트너, 직원 등의 신원과 신용도를 확인하는 조사입니다.",
      sortOrder: 3,
      fields: [
        {
          key: "targetName",
          label: "조사대상자 이름",
          type: "text",
          required: true,
          placeholder: "예: 이영희",
          aiPrompt: "신원 조사 대상의 이름",
        },
        {
          key: "targetBirthYear",
          label: "생년월일",
          type: "text",
          required: false,
          placeholder: "예: 1990.05.15",
          aiPrompt: "대상의 생년월일",
        },
        {
          key: "investigationType",
          label: "조사 목적",
          type: "select",
          required: true,
          options: ["결혼 전 조사", "사업 파트너 조사", "채용 조사", "기타"],
          aiPrompt: "신원 조사를 하는 목적",
        },
        {
          key: "targetAddress",
          label: "조사대상자 주소",
          type: "textarea",
          required: false,
          placeholder: "예: 경기도 성남시",
          aiPrompt: "대상의 현재 거주지",
        },
        {
          key: "targetWorkplace",
          label: "직장 정보",
          type: "text",
          required: false,
          placeholder: "예: OO기업",
          aiPrompt: "대상의 직장명",
        },
        {
          key: "concernAreas",
          label: "확인하고 싶은 사항",
          type: "textarea",
          required: true,
          placeholder: "예: 학력, 경력, 재산, 신용, 전과 여부 등",
          aiPrompt: "구체적으로 확인하고 싶은 내용",
        },
        {
          key: "clientContact",
          label: "의뢰인 연락처",
          type: "phone",
          required: true,
          placeholder: "010-3333-4444",
          aiPrompt: "의뢰인의 전화번호",
        },
      ],
      conversationFlow: [
        {
          step: 1,
          message:
            "신원조사 의뢰를 시작하겠습니다. 조사 대상자의 성함을 알려주세요.",
          expectedFields: ["targetName"],
        },
        {
          step: 2,
          message:
            "어떤 목적으로 신원조사가 필요하신가요? (결혼, 사업, 채용 등)",
          expectedFields: ["investigationType"],
        },
        {
          step: 3,
          message:
            "구체적으로 확인하고 싶은 사항이 있으신가요? (학력, 경력, 재산, 신용 등)",
          expectedFields: ["concernAreas"],
        },
        {
          step: 4,
          message:
            "조사에 도움이 될 정보(주소, 직장 등)를 알고 계시면 알려주세요.",
          expectedFields: [
            "targetAddress",
            "targetWorkplace",
            "targetBirthYear",
          ],
        },
        {
          step: 5,
          message: "의뢰인님의 연락처를 남겨주세요.",
          expectedFields: ["clientContact"],
        },
      ],
    },
  ];

  for (const t of templates) {
    const exists = await repo.findOne({ where: { name: t.name } });
    if (!exists) {
      await repo.save(repo.create(t as unknown as RequestTemplate));
      console.log(`✅ Created template: ${t.name}`);
    } else {
      console.log(`⏭️  Template already exists: ${t.name}`);
    }
  }

  console.log("🌱 Request templates seeded");
}
