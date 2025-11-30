import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../services/api';

function ReportCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('caseId') || '';
  const [title, setTitle] = useState('');
  const user = useSelector((state: any) => state.auth.user);
  const isDetective = user?.role === 'detective';
  const detectiveInfo = isDetective
    ? `${user.name || '탐정'} (${user.affiliation || '소속사 미정'})`
    : '';

  // AI 분석 데이터 및 자동 생성 플래그 확인
  const aiAnalysis = location.state?.aiAnalysis;
  const autoGenerateReport = location.state?.autoGenerateReport;

  const initialAnalysis = aiAnalysis || null;

  // AI 분석 결과를 바탕으로 자동 보고서 생성
  const generateAutoReport = (analysis: any) => {
    const currentDate = new Date().toLocaleDateString('ko-KR');
    const confidencePercent = (analysis.confidence * 100).toFixed(1);

    let reportContent = `AI 자동 생성 보고서\n\n`;
    reportContent += `조사자: ${detectiveInfo}\n`;
    reportContent += `사건 ID: ${caseId}\n`;
    reportContent += `분석 일시: ${currentDate}\n`;
    reportContent += `AI 분석 신뢰도: ${confidencePercent}%\n\n`;

    reportContent += `1. AI 분석 개요\n`;
    reportContent += `- 분석 대상: 증거 자료\n`;
    reportContent += `- 분석 방법: AI 기반 패턴 인식 및 리스크 평가\n`;
    reportContent += `- 신뢰도 수준: ${confidencePercent}%\n\n`;

    if (analysis.categories && analysis.categories.length > 0) {
      reportContent += `2. 분석 카테고리\n`;
      analysis.categories.forEach((cat: any, index: number) => {
        reportContent += `${index + 1}. ${cat.name} (점수: ${cat.score})\n`;
        if (cat.details) {
          reportContent += `   - 세부사항: ${cat.details}\n`;
        }
      });
      reportContent += `\n`;
    }

    if (analysis.detectedPatterns && analysis.detectedPatterns.length > 0) {
      reportContent += `3. 감지된 패턴\n`;
      analysis.detectedPatterns.forEach((pattern: string, index: number) => {
        reportContent += `${index + 1}. ${pattern}\n`;
      });
      reportContent += `\n`;
    }

    if (analysis.riskAssessment) {
      reportContent += `4. 리스크 평가\n`;
      reportContent += `- 리스크 수준: ${analysis.riskAssessment.level}\n`;
      reportContent += `- 리스크 점수: ${analysis.riskAssessment.score}\n`;
      if (analysis.riskAssessment.factors && analysis.riskAssessment.factors.length > 0) {
        reportContent += `- 주요 리스크 요인:\n`;
        analysis.riskAssessment.factors.forEach((factor: string, index: number) => {
          reportContent += `  ${index + 1}. ${factor}\n`;
        });
      }
      reportContent += `\n`;
    }

    if (analysis.recommendations && analysis.recommendations.length > 0) {
      reportContent += `5. AI 권장 사항\n`;
      analysis.recommendations.forEach((rec: string, index: number) => {
        reportContent += `${index + 1}. ${rec}\n`;
      });
      reportContent += `\n`;
    }

    reportContent += `6. 결론 및 추가 조사 방향\n`;
    reportContent += `- 본 분석 결과는 AI 기반 자동 분석으로 생성되었습니다.\n`;
    reportContent += `- 추가적인 전문가 검토 및 현장 조사가 필요할 수 있습니다.\n`;
    reportContent += `- 증거의 신뢰성과 분석 정확도를 위해 추가 검증을 권장합니다.\n\n`;

    reportContent += `조사자 확인: ${detectiveInfo}\n`;
    reportContent += `보고서 생성일: ${currentDate}\n\n`;

    reportContent += `(본 보고서는 AI 분석 결과를 바탕으로 자동 생성되었으며, 탐정의 전문적 판단에 따라 수정될 수 있습니다.)`;

    return reportContent;
  };

  // 컴포넌트 마운트 시 자동 보고서 생성
  useEffect(() => {
    if (autoGenerateReport && aiAnalysis) {
      const autoReport = generateAutoReport(aiAnalysis);
      setContent(autoReport);
      setTitle(`AI 분석 보고서 - ${caseId}`);
    }
  }, [autoGenerateReport, aiAnalysis, caseId, detectiveInfo]);
  const summarizeAnalysis = (a: any) => {
    try {
      const lines: string[] = [];
      if (a.confidence !== undefined)
        lines.push(`분석 신뢰도: ${(a.confidence * 100).toFixed(1)}%`);
      if (a.riskAssessment)
        lines.push(`리스크 수준: ${a.riskAssessment.level} (점수 ${a.riskAssessment.score})`);
      if (Array.isArray(a.detectedPatterns) && a.detectedPatterns.length)
        lines.push(`감지된 패턴: ${a.detectedPatterns.join(', ')}`);
      if (Array.isArray(a.recommendations) && a.recommendations.length)
        lines.push(`권장 사항:\n- ${a.recommendations.join('\n- ')}`);
      return lines.join('\n');
    } catch (e) {
      return '';
    }
  };
  const [content, setContent] = useState(
    initialAnalysis
      ? `AI 분석 요약:\n${summarizeAnalysis(initialAnalysis)}\n\n(추가 내용 작성)`
      : ''
  );

  // 확장된 보고서 템플릿들
  const templates = [
    {
      id: 'brief',
      name: '간단 요약 보고서',
      desc: '핵심 사실과 결론 위주 간단 보고서',
      content: `제목: 사건 요약\n\n조사 개요:\n- 사건 ID: ${caseId}\n- 조사 기간: \n- 조사자: ${detectiveInfo}\n\n핵심 사실:\n1. \n2. \n\n결론 및 권장 조치:\n- \n\n(첨부: 증거 목록)\n`,
    },
    {
      id: 'detailed',
      name: '상세 조사보고서',
      desc: '상황, 증거, 조사 절차를 자세히 기술하는 보고서',
      content: `제목: 상세 조사보고서\n\n조사자 정보:\n- 성명: ${detectiveInfo}\n- 자격증/면허: \n- 소속 기관: \n\n1. 사건 개요\n- 의뢰인: \n- 사건 내용: \n- 발생 일시/장소: \n\n2. 조사 목적 및 범위\n- \n\n3. 조사 방법 및 과정\n- 현장조사: \n- 인터뷰: \n- 디지털 포렌식: \n- 증거 수집: \n\n4. 수집된 증거 목록\n- 사진: \n- 영상: \n- 문서: \n- 디지털 데이터: \n\n5. 분석 및 결과\n- 증거 분석 요약: \n- 기술적 분석: \n- 법적 분석: \n\n6. 결론 및 권장 조치\n- 법적 대응 권고: \n- 추가 조사 필요사항: \n\n조사 완료일: \n\n조사자 서명: ${detectiveInfo}\n\n(첨부파일 및 로그 포함)\n`,
    },
    {
      id: 'evidence',
      name: '증거 중심 보고서',
      desc: '수집된 증거를 중심으로 정리된 보고서',
      content: `제목: 증거 목록 및 설명\n\n조사자: ${detectiveInfo}\n요약:\n- 사건 ID: ${caseId}\n- 총 증거 개수: \n\n증거 1:\n- 유형: 사진\n- 설명: \n- 수집 일시/장소: \n- 무결성(해시/블록체인): \n- 분석 결과: \n\n증거 2:\n- 유형: 영상\n- 설명: \n- 분석 결과: \n\n증거 3:\n- 유형: 문서\n- 설명: \n- 진위 여부: \n\n증거 4:\n- 유형: 디지털 데이터\n- 설명: \n- 포렌식 분석: \n\n결론:\n- 증거 신뢰성 평가: \n- 추가 분석 필요사항: \n\n(각 증거마다 메타데이터와 분석 결과 기재)\n`,
    },
    {
      id: 'legal',
      name: '법적 진술서(진술서/확인서)',
      desc: '법적 효력을 위한 진술서 형식 템플릿',
      content: `제목: 진술서\n\n본인은 아래와 같이 사실을 진술합니다.\n\n조사자 정보:\n- 성명: ${detectiveInfo}\n- 자격사항: \n\n1. 성명: \n2. 주소: \n3. 사건 발생 일시 및 경위: \n\n상기 내용은 사실이며 이를 증명할 수 있는 증거는 다음과 같습니다.\n\n증거 목록:\n1. \n2. \n\n본 진술서는 사실에 근거하며, 허위사실의 기재가 없음을 확인합니다.\n\n(서명)\n\n날짜: \n조사자 확인: ${detectiveInfo}\n\n(첨부: 증거 목록 및 분석 보고서)\n`,
    },
    {
      id: 'executive',
      name: '경영진 요약(Executive Summary)',
      desc: '의뢰인/사내 임원용 간결 요약',
      content: `제목: Executive Summary\n\n조사자: ${detectiveInfo}\n\n사건 개요:\n- 핵심 포인트 1\n- 핵심 포인트 2\n\n주요 영향:\n- 재무적 영향: \n- 법적 리스크: \n- 평판 영향: \n\n권장 조치(단기/중장기):\n- 단기: \n- 중장기: \n\n리스크 평가: 높음/중간/낮음\n\n(추가 자료는 본문 참조)\n`,
    },
    {
      id: 'forensic',
      name: '디지털 포렌식 보고서',
      desc: '디지털 증거 분석 중심 보고서',
      content: `제목: 디지털 포렌식 분석 보고서\n\n조사자: ${detectiveInfo}\n사건 ID: ${caseId}\n\n1. 분석 개요\n- 대상 시스템: \n- 분석 기간: \n- 사용 도구: \n\n2. 수집된 디지털 증거\n- 하드 드라이브 이미지: \n- 메모리 덤프: \n- 네트워크 로그: \n- 모바일 디바이스: \n\n3. 분석 방법\n- 타임라인 분석: \n- 파일 시스템 분석: \n- 레지스트리 분석: \n- 아티팩트 추출: \n\n4. 주요 발견사항\n- 삭제된 파일 복원: \n- 사용자 활동 로그: \n- 악성코드 발견: \n- 데이터 유출 흔적: \n\n5. 결론 및 권고사항\n- 증거 무결성: \n- 법적 효력: \n\n분석 완료일: \n\n(첨부: 분석 도구 출력, 해시 값, 체인 오브 커스터디)\n`,
    },
    {
      id: 'surveillance',
      name: '감시/추적 보고서',
      desc: '현장 감시 및 추적 조사 보고서',
      content: `제목: 현장 감시 및 추적 조사 보고서\n\n조사자: ${detectiveInfo}\n사건 ID: ${caseId}\n\n1. 조사 계획\n- 대상: \n- 기간: \n- 방법: \n\n2. 감시 활동 기록\n일시: \n장소: \n관찰 내용: \n증거 수집: \n\n3. 추적 결과\n- 이동 경로: \n- 접촉자: \n- 증거 발견: \n\n4. 사진/영상 증거\n- 파일명: \n- 촬영 일시: \n- 설명: \n\n5. 결론\n- 조사 결과 요약: \n- 추가 조치 권고: \n\n감시 완료일: \n\n(첨부: 원본 사진/영상 파일, 위치 데이터)\n`,
    },
    {
      id: 'financial',
      name: '금융 조사 보고서',
      desc: '금융 거래 및 자금 흐름 분석 보고서',
      content: `제목: 금융 조사 보고서\n\n조사자: ${detectiveInfo}\n사건 ID: ${caseId}\n\n1. 조사 대상\n- 개인/기업명: \n- 조사 기간: \n\n2. 자금 흐름 분석\n- 입금 내역: \n- 출금 내역: \n- 송금 기록: \n- 자산 현황: \n\n3. 금융 기관 조회 결과\n- 은행 계좌: \n- 신용카드: \n- 투자 계좌: \n\n4. 이상 거래 발견\n- 의심 거래 1: \n- 의심 거래 2: \n\n5. 결론 및 권고\n- 자금 출처: \n- 리스크 평가: \n- 추가 조사 필요: \n\n(첨부: 금융 문서 사본, 거래 내역서)\n`,
    },
    {
      id: 'background',
      name: '배경 조사 보고서',
      desc: '개인/기업 배경 및 신원 조사 보고서',
      content: `제목: 배경 조사 보고서\n\n조사자: ${detectiveInfo}\n사건 ID: ${caseId}\n\n1. 조사 대상 정보\n- 성명: \n- 생년월일: \n- 주소: \n- 연락처: \n\n2. 신원 확인\n- 주민등록등본: \n- 가족관계: \n- 학력: \n- 경력: \n\n3. 재산 및 자산\n- 부동산: \n- 차량: \n- 금융자산: \n\n4. 사회적 관계\n- 지인/친구: \n- 소셜 미디어: \n- 온라인 활동: \n\n5. 특이사항\n- 범죄 기록: \n- 소송 이력: \n- 기타: \n\n6. 결론\n- 신뢰성 평가: \n- 리스크 요인: \n\n조사 완료일: \n\n(첨부: 신분증 사본, 조회 문서)\n`,
    },
    {
      id: 'incident',
      name: '사건 현장 조사 보고서',
      desc: '사건 현장 출동 및 초기 조사 보고서',
      content: `제목: 사건 현장 조사 보고서\n\n조사자: ${detectiveInfo}\n사건 ID: ${caseId}\n\n1. 출동 정보\n- 출동 일시: \n- 현장 주소: \n- 의뢰인: \n\n2. 현장 상황\n- 현장 상태: \n- 목격자: \n- 환경 조건: \n\n3. 초기 증거 수집\n- 사진 촬영: \n- 비디오 녹화: \n- 물품 수거: \n- 진술 녹음: \n\n4. 현장 분석\n- 사건 재구성: \n- 증거 배치도: \n- 시간대별 타임라인: \n\n5. 즉시 조치사항\n- 보존 조치: \n- 추가 조사 계획: \n\n현장 조사 완료일: \n\n(첨부: 현장 사진, 비디오, 수거 물품 목록)\n`,
    },
  ];
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/reports', { caseId, title, content });
      navigate('/reports');
    } catch (e) {
      console.error('Failed to create report', e);
      alert('보고서 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        보고서 작성
      </Typography>
      <TextField
        fullWidth
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="template-select-label">템플릿 선택</InputLabel>
        <Select
          labelId="template-select-label"
          value={selectedTemplate}
          label="템플릿 선택"
          onChange={(e) => {
            const id = e.target.value as string;
            const tpl = templates.find((t) => t.id === id);
            if (!tpl) {
              setSelectedTemplate('');
              return;
            }
            if (content && content.trim() !== '') {
              const ok = window.confirm(
                '기존 내용이 삭제되고 선택한 템플릿으로 대체됩니다. 계속하시겠습니까?'
              );
              if (!ok) return;
            }
            setSelectedTemplate(id);
            setContent(tpl.content);
          }}
        >
          <MenuItem value="">(템플릿 없음)</MenuItem>
          {templates.map((t) => (
            <MenuItem key={t.id} value={t.id} title={t.desc}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        multiline
        minRows={8}
        label="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ mb: 2 }}
      />
      {selectedTemplate && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {templates.find((t) => t.id === selectedTemplate)?.desc}
          </Typography>
          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={() => {
              const tpl = templates.find((t) => t.id === selectedTemplate);
              if (tpl) setContent(tpl.content);
            }}
          >
            템플릿 다시 적용
          </Button>
          <Button
            size="small"
            sx={{ mt: 1, ml: 1 }}
            onClick={() => {
              setSelectedTemplate('');
            }}
          >
            템플릿 해제
          </Button>
        </Box>
      )}
      <Box>
        <Button variant="contained" onClick={submit} disabled={loading}>
          {loading ? '작성 중...' : '작성/제출'}
        </Button>
        <Button sx={{ ml: 2 }} onClick={() => navigate(-1)}>
          취소
        </Button>
      </Box>
    </Box>
  );
}

export default ReportCreate;
