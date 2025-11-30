import React, { useEffect, useState } from 'react';
import { Container, Typography, Tabs, Tab, Box, Paper, Button, Grid } from '@mui/material';
// 각 DB별 테이블 컴포넌트 import 예정

const dbTabs = [
  { label: '사건(Case)', key: 'cases' },
  { label: '증거(Evidence)', key: 'evidence' },
  { label: '회원(User)', key: 'users' },
  { label: '상담(Consultation)', key: 'consultations' },
  { label: '견적(Quote)', key: 'quotes' },
  { label: '템플릿(Pricing)', key: 'templates' },
  { label: '탐정(Detective)', key: 'detectives' },
];

const AdminDbPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  // 각 DB별 데이터 상태
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 전국 시도/시군구 목록 (샘플, 실제 DB/공공데이터로 확장 가능)
  const regions = [
    '서울',
    '경기',
    '인천',
    '부산',
    '대구',
    '광주',
    '대전',
    '울산',
    '세종',
    '강원',
    '충북',
    '충남',
    '전북',
    '전남',
    '경북',
    '경남',
    '제주',
  ];
  const citiesByRegion: Record<string, string[]> = {
    서울: ['강남구', '서초구', '송파구', '마포구', '종로구'],
    경기: ['수원시', '성남시', '고양시', '용인시', '안양시'],
    // ... 기타 시군구 샘플
  };
  const [region, setRegion] = useState<string>('');
  const [city, setCity] = useState<string>('');

  // 탐정 자동 추천 관련 상태
  const [specialty, setSpecialty] = useState<string>('');
  const [minExperience, setMinExperience] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [minSuccessRate, setMinSuccessRate] = useState<number>(0);
  // CRUD 관련 상태 (탭별 공통)
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [editMode, setEditMode] = useState<'add' | 'edit' | null>(null);
  const [matchResults, setMatchResults] = useState<any[]>([]);

  useEffect(() => {
    const key = dbTabs[tab].key;
    const fetchData = async () => {
      setLoading(true);
      let url = `/api/${key}`;
      if (key === 'detectives' && (region || city)) {
        const params = [];
        if (region) params.push(`region=${encodeURIComponent(region)}`);
        if (city) params.push(`city=${encodeURIComponent(city)}`);
        url += '?' + params.join('&');
      }
      try {
        const res = await fetch(url, { credentials: 'include' });
        const result = await res.json();
        setData((prev: any) => ({ ...prev, [key]: result }));
      } catch {
        setData((prev: any) => ({ ...prev, [key]: [] }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab, region, city]);

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        관리자 DB 관리
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4 }}>
        {dbTabs.map((t) => (
          <Tab key={t.key} label={t.label} />
        ))}
      </Tabs>
      <Box>
        {loading ? (
          <Typography>로딩 중...</Typography>
        ) : (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {dbTabs[tab].label} 목록
            </Typography>
            {dbTabs[tab].key === 'detectives' ? (
              <>
                {/* 필터/추천/카드/CRUD UI */}
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <select
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setCity('');
                    }}
                    title="시도 선택"
                  >
                    <option value="">전체 시도</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!region}
                    title="시군구 선택"
                  >
                    <option value="">전체 시군구</option>
                    {(citiesByRegion[region] || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    title="전문분야 선택"
                  >
                    <option value="">전체 전문분야</option>
                    {['불륜조사', '소재파악', '신원조회', '법적증거', '기업조사', '사이버조사'].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                  <label className="form-label">최소경력</label>
                  <input
                    type="number"
                    min={0}
                    value={minExperience}
                    onChange={(e) => setMinExperience(Number(e.target.value))}
                    placeholder="0년 이상"
                    className="form-input"
                  />
                  <label className="form-label">최소 평점</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    placeholder="0점 이상"
                    className="form-input"
                  />
                  <label className="form-label">최소 성공률</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={minSuccessRate}
                    onChange={(e) => setMinSuccessRate(Number(e.target.value))}
                    placeholder="0% 이상"
                    className="form-input"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setRegion('');
                      setCity('');
                      setSpecialty('');
                      setMinExperience(0);
                      setMinRating(0);
                      setMinSuccessRate(0);
                    }}
                  >
                    초기화
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                      let url = `/api/detectives/match?`;
                      const params = [];
                      if (region) params.push(`region=${encodeURIComponent(region)}`);
                      if (city) params.push(`city=${encodeURIComponent(city)}`);
                      if (specialty) params.push(`specialty=${encodeURIComponent(specialty)}`);
                      if (minExperience) params.push(`minExperience=${minExperience}`);
                      if (minRating) params.push(`minRating=${minRating}`);
                      if (minSuccessRate) params.push(`minSuccessRate=${minSuccessRate}`);
                      url += params.join('&');
                      const res = await fetch(url, { credentials: 'include' });
                      const data = await res.json();
                      setMatchResults(Array.isArray(data) ? data : []);
                    }}
                  >
                    자동 추천
                  </Button>
                </Box>
                {/* 추천 결과 카드 UI */}
                {matchResults.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      추천 탐정 리스트
                    </Typography>
                    <Grid container spacing={2}>
                      {matchResults.map((d, idx) => (
                        <Grid item xs={12} md={6} lg={4} key={d.id || idx}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="h6">{d.name}</Typography>
                            <Typography variant="body2">
                              지역: {d.region} {d.city}
                            </Typography>
                            <Typography variant="body2">
                              전문분야:{' '}
                              {Array.isArray(d.specialties)
                                ? d.specialties.map((s: any) => s.category).join(', ')
                                : ''}
                            </Typography>
                            <Typography variant="body2">경력: {d.experienceYears}년</Typography>
                            <Typography variant="body2">평점: {d.averageRating}</Typography>
                            <Typography variant="body2">성공률: {d.successRate}%</Typography>
                            <Typography variant="body2">
                              담당 건수: {d.currentCaseCount} / {d.maxConcurrentCases}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                {/* 탐정 DB 테이블/카드 CRUD UI */}
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setEditMode('add');
                      setEditValues({});
                      setSelectedRow(null);
                    }}
                  >
                    추가
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={!selectedRow}
                    onClick={() => {
                      setEditMode('edit');
                      setEditValues(selectedRow || {});
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={!selectedRow}
                    onClick={async () => {
                      if (!selectedRow) return;
                      const key = dbTabs[tab].key;
                      const res = await fetch(`/api/${key}/${selectedRow.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                      });
                      if (res.ok) {
                        setData((prev: any) => ({
                          ...prev,
                          [key]: prev[key].filter((r: any) => r.id !== selectedRow.id),
                        }));
                        setSelectedRow(null);
                      } else {
                        alert('삭제 실패');
                      }
                    }}
                  >
                    삭제
                  </Button>
                </Box>
                {/* 추가/수정 폼 */}
                {(editMode === 'add' || editMode === 'edit') && (
                  <Box sx={{ mt: 2, p: 2, background: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      {editMode === 'add' ? '새 항목 추가' : '항목 수정'}
                    </Typography>
                    {data[dbTabs[tab].key].length > 0 &&
                      Object.keys(data[dbTabs[tab].key][0]).map((col) => (
                        <Box key={col} sx={{ mb: 2 }}>
                          <label className="form-label">{col}</label>
                          <input
                            value={editValues[col] ?? ''}
                            onChange={(e) =>
                              setEditValues((vals: any) => ({ ...vals, [col]: e.target.value }))
                            }
                            className="form-input"
                            disabled={col === 'id'}
                            placeholder={`Enter ${col}`}
                            title={`Input for ${col}`}
                          />
                        </Box>
                      ))}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => {
                          const key = dbTabs[tab].key;
                          if (editMode === 'add') {
                            const res = await fetch(`/api/${key}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify(editValues),
                            });
                            if (res.ok) {
                              const newItem = await res.json();
                              setData((prev: any) => ({ ...prev, [key]: [...prev[key], newItem] }));
                              setEditMode(null);
                              setEditValues({});
                            } else {
                              alert('추가 실패');
                            }
                          } else if (editMode === 'edit') {
                            const res = await fetch(`/api/${key}/${editValues.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify(editValues),
                            });
                            if (res.ok) {
                              const updated = await res.json();
                              setData((prev: any) => ({
                                ...prev,
                                [key]: prev[key].map((r: any) =>
                                  r.id === updated.id ? updated : r
                                ),
                              }));
                              setEditMode(null);
                              setEditValues({});
                              setSelectedRow(updated);
                            } else {
                              alert('수정 실패');
                            }
                          }
                        }}
                      >
                        저장
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditMode(null);
                          setEditValues({});
                        }}
                      >
                        취소
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            ) : (
              Array.isArray(data[dbTabs[tab].key]) && (
                <>
                  <Box sx={{ overflowX: 'auto', mb: 2 }}>
                    <table className="data-table">
                      <thead>
                        <tr className="data-table-header">
                          {data[dbTabs[tab].key].length > 0 &&
                            Object.keys(data[dbTabs[tab].key][0]).map((col) => (
                              <th key={col} className="data-table-cell">
                                {col}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data[dbTabs[tab].key].map((row: any, idx: number) => (
                          <tr
                            key={row.id || idx}
                            className={`data-table-row ${
                              selectedRow?.id === row.id ? 'selected' : ''
                            }`}
                            onClick={() => {
                              setSelectedRow(row);
                              setEditValues(row);
                              setEditMode(null);
                            }}
                          >
                            {Object.keys(row).map((col) => (
                              <td key={col} className="data-table-cell">
                                {String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setEditMode('add');
                        setEditValues({});
                        setSelectedRow(null);
                      }}
                    >
                      추가
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={!selectedRow}
                      onClick={() => {
                        setEditMode('edit');
                        setEditValues(selectedRow || {});
                      }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={!selectedRow}
                      onClick={async () => {
                        if (!selectedRow) return;
                        const key = dbTabs[tab].key;
                        const res = await fetch(`/api/${key}/${selectedRow.id}`, {
                          method: 'DELETE',
                          credentials: 'include',
                        });
                        if (res.ok) {
                          setData((prev: any) => ({
                            ...prev,
                            [key]: prev[key].filter((r: any) => r.id !== selectedRow.id),
                          }));
                          setSelectedRow(null);
                        } else {
                          alert('삭제 실패');
                        }
                      }}
                    >
                      삭제
                    </Button>
                  </Box>
                  {(editMode === 'add' || editMode === 'edit') && (
                    <Box sx={{ mt: 2, p: 2, background: '#f8fafc', borderRadius: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {editMode === 'add' ? '새 항목 추가' : '항목 수정'}
                      </Typography>
                      {data[dbTabs[tab].key].length > 0 &&
                        Object.keys(data[dbTabs[tab].key][0]).map((col) => (
                          <Box key={col} sx={{ mb: 2 }}>
                            <label className="form-label">{col}</label>
                            <input
                              value={editValues[col] ?? ''}
                              onChange={(e) =>
                                setEditValues((vals: any) => ({ ...vals, [col]: e.target.value }))
                              }
                              className="form-input"
                              disabled={col === 'id'}
                              placeholder={`Enter ${col}`}
                              title={`Input for ${col}`}
                            />
                          </Box>
                        ))}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={async () => {
                            const key = dbTabs[tab].key;
                            if (editMode === 'add') {
                              const res = await fetch(`/api/${key}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(editValues),
                              });
                              if (res.ok) {
                                const newItem = await res.json();
                                setData((prev: any) => ({
                                  ...prev,
                                  [key]: [...prev[key], newItem],
                                }));
                                setEditMode(null);
                                setEditValues({});
                              } else {
                                alert('추가 실패');
                              }
                            } else if (editMode === 'edit') {
                              const res = await fetch(`/api/${key}/${editValues.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(editValues),
                              });
                              if (res.ok) {
                                const updated = await res.json();
                                setData((prev: any) => ({
                                  ...prev,
                                  [key]: prev[key].map((r: any) =>
                                    r.id === updated.id ? updated : r
                                  ),
                                }));
                                setEditMode(null);
                                setEditValues({});
                                setSelectedRow(updated);
                              } else {
                                alert('수정 실패');
                              }
                            }
                          }}
                        >
                          저장
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditMode(null);
                            setEditValues({});
                          }}
                        >
                          취소
                        </Button>
                      </Box>
                    </Box>
                  )}
                </>
              )
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default AdminDbPage;
