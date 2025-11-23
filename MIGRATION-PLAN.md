# 🔗 루트 UI → React 마이그레이션 계획

**작성일**: 2025년 1월
**목표**: 루트 레벨 정적 사이트 작업을 `packages/frontend/` React 앱으로 통합

---

## 📋 마이그레이션 개요

### 소스 (루트 레벨 정적 사이트)

```
c:\Projects\piip-platform\
├── index.html (253줄)
├── styles.css (636줄)
├── app.js (378줄)
└── 탐정사진/
    └── 탐정사진 기본.png
```

### 목적지 (React 앱)

```
packages/frontend/src/
├── components/
│   ├── HeroGallery/
│   ├── Lightbox/
│   ├── AppButton/
│   └── ThemeToggle/
├── pages/
│   └── HomePage.tsx
├── theme.ts
└── assets/
    └── images/
```

---

## 🎯 Phase 1: 컴포넌트 생성

### 1.1. AppButton 컴포넌트

**파일 구조**:

```
packages/frontend/src/components/AppButton/
├── AppButton.tsx
├── AppButton.module.css
└── index.ts
```

**AppButton.tsx**:

```tsx
import React from "react";
import styles from "./AppButton.module.css";

interface AppButtonProps {
  variant?: "primary" | "secondary" | "danger" | "soft" | "icon" | "text";
  size?: "sm" | "md" | "lg";
  icon?: string; // Material Icons name
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  onClick,
  disabled = false,
  type = "button",
  ariaLabel,
}) => {
  const classNames = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
  ].join(" ");

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon && <span className="material-icons-outlined">{icon}</span>}
      {children}
    </button>
  );
};
```

**AppButton.module.css**:

```css
/* 현재 styles.css의 .btn 스타일을 복사 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--primary {
  background-color: var(--clr-primary);
  color: white;
}

/* ... 나머지 variant 스타일 */
```

**통합 체크리스트**:

- [ ] TypeScript Props 인터페이스 정의
- [ ] CSS Modules 변환 (현재 styles.css에서)
- [ ] Material Icons 아이콘 지원
- [ ] 접근성 (aria-label)
- [ ] 호버/포커스 상태
- [ ] 비활성화 상태
- [ ] Storybook 스토리 추가

---

### 1.2. ThemeToggle 컴포넌트

**파일 구조**:

```
packages/frontend/src/components/ThemeToggle/
├── ThemeToggle.tsx
└── index.ts
```

**ThemeToggle.tsx**:

```tsx
import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { AppButton } from "@/components/AppButton";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppButton
      variant="icon"
      icon={theme === "dark" ? "light_mode" : "dark_mode"}
      onClick={toggleTheme}
      ariaLabel={`현재 ${theme === "dark" ? "다크" : "라이트"} 모드, 클릭하여 전환`}
    />
  );
};
```

**useTheme Hook**:

```tsx
// packages/frontend/src/hooks/useTheme.ts
import { useState, useEffect } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "light" | "dark") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
};
```

**통합 체크리스트**:

- [ ] localStorage 영속성
- [ ] MUI ThemeProvider 통합
- [ ] Redux 상태 관리 (선택)
- [ ] 시스템 설정 감지 (`prefers-color-scheme`)
- [ ] 애니메이션 전환

---

### 1.3. HeroGallery 컴포넌트

**파일 구조**:

```
packages/frontend/src/components/HeroGallery/
├── HeroGallery.tsx
├── HeroGallery.module.css
└── index.ts
```

**HeroGallery.tsx**:

```tsx
import React, { useState } from "react";
import { Lightbox } from "@/components/Lightbox";
import styles from "./HeroGallery.module.css";

interface HeroGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    title?: string;
  }>;
}

export const HeroGallery: React.FC<HeroGalleryProps> = ({ images }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <section className={styles.heroGallery}>
        <div className={styles.container}>
          <h1 className={styles.title}>전문 탐정 서비스</h1>
          <p className={styles.subtitle}>
            PIIP 플랫폼으로 모든 조사 업무를 한 곳에서
          </p>

          <div className={styles.galleryGrid}>
            {images.map((image, index) => (
              <div
                key={index}
                className={styles.heroCard}
                onClick={() => handleImageClick(index)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleImageClick(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${image.alt} 확대 보기`}
              >
                <img src={image.src} alt={image.alt} />
                <div className={styles.overlay}>
                  <span className="material-icons-outlined">zoom_in</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentIndex}
        />
      )}
    </>
  );
};
```

**통합 체크리스트**:

- [ ] 이미지 배열 Props
- [ ] 클릭 시 라이트박스 오픈
- [ ] 키보드 접근성 (Enter, Space)
- [ ] 반응형 그리드
- [ ] 호버 오버레이 효과
- [ ] MUI Grid 사용 (선택)

---

### 1.4. Lightbox 컴포넌트

**파일 구조**:

```
packages/frontend/src/components/Lightbox/
├── Lightbox.tsx
├── Lightbox.module.css
├── useLightbox.ts
└── index.ts
```

**Lightbox.tsx**:

```tsx
import React, { useEffect, useRef } from "react";
import { useLightbox } from "./useLightbox";
import { AppButton } from "@/components/AppButton";
import styles from "./Lightbox.module.css";

interface LightboxProps {
  images: Array<{ src: string; alt: string }>;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const {
    isAutoplay,
    toggleAutoplay,
    shuffle,
    handlePrev,
    handleNext,
    handleKeyDown,
  } = useLightbox({
    images,
    currentIndex,
    onNavigate,
    onClose,
  });

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus trap
    dialogRef.current?.focus();
  }, []);

  const currentImage = images[currentIndex];

  return (
    <div
      ref={dialogRef}
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 갤러리"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.content}>
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className={styles.image}
        />

        <div className={styles.controls}>
          <AppButton
            variant="icon"
            icon="close"
            onClick={onClose}
            ariaLabel="닫기"
          />
          <AppButton
            variant="icon"
            icon="chevron_left"
            onClick={handlePrev}
            ariaLabel="이전 이미지"
          />
          <AppButton
            variant="icon"
            icon="chevron_right"
            onClick={handleNext}
            ariaLabel="다음 이미지"
          />
          <AppButton
            variant="icon"
            icon={isAutoplay ? "pause" : "play_arrow"}
            onClick={toggleAutoplay}
            ariaLabel={isAutoplay ? "자동재생 중지" : "자동재생 시작"}
          />
          <AppButton
            variant="icon"
            icon="shuffle"
            onClick={shuffle}
            ariaLabel="셔플"
          />
        </div>

        <div className={styles.counter}>
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};
```

**useLightbox.ts**:

```tsx
import { useState, useEffect, useCallback } from "react";

interface UseLightboxProps {
  images: any[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

export const useLightbox = ({
  images,
  currentIndex,
  onNavigate,
  onClose,
}: UseLightboxProps) => {
  const [isAutoplay, setIsAutoplay] = useState(false);

  const handlePrev = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const shuffle = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    onNavigate(randomIndex);
  }, [images.length, onNavigate]);

  const toggleAutoplay = () => {
    setIsAutoplay((prev) => !prev);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    },
    [onClose, handlePrev, handleNext]
  );

  // 자동재생
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(handleNext, 3000);
    return () => clearInterval(interval);
  }, [isAutoplay, handleNext]);

  return {
    isAutoplay,
    toggleAutoplay,
    shuffle,
    handlePrev,
    handleNext,
    handleKeyDown,
  };
};
```

**통합 체크리스트**:

- [ ] 모달 오버레이
- [ ] 키보드 컨트롤 (ESC, 화살표)
- [ ] 포커스 트랩
- [ ] 자동재생 (3초)
- [ ] 셔플 기능
- [ ] 이미지 카운터
- [ ] 터치 스와이프 (모바일)
- [ ] 애니메이션 전환

---

## 🎯 Phase 2: 페이지 통합

### 2.1. HomePage 생성

**packages/frontend/src/pages/HomePage.tsx**:

```tsx
import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { HeroGallery } from "@/components/HeroGallery";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const galleryImages = [
    {
      src: "/images/탐정사진 기본.png",
      alt: "전문 탐정 서비스",
      title: "PIIP 플랫폼",
    },
  ];

  return (
    <>
      <HeroGallery images={galleryImages} />

      {/* 서비스 소개 섹션 */}
      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom align="center">
            PIIP 플랫폼이란?
          </Typography>
          <Typography variant="body1" paragraph align="center">
            탐정 1인이 모든 업무를 하나의 플랫폼에서 끝낼 수 있는 올인원 솔루션
          </Typography>
        </Box>

        {/* 주요 기능 카드 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 4,
            py: 4,
          }}
        >
          {/* 사건 관리 */}
          <Box sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom>
              📋 사건 관리
            </Typography>
            <Typography variant="body2">
              조사 사건 생성부터 종료까지 체계적으로 관리
            </Typography>
          </Box>

          {/* 증거 관리 */}
          <Box sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom>
              📂 증거 관리
            </Typography>
            <Typography variant="body2">
              파일 업로드, 태그, 블록체인 보관으로 무결성 보장
            </Typography>
          </Box>

          {/* AI 분석 */}
          <Box sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h5" gutterBottom>
              🤖 AI 분석
            </Typography>
            <Typography variant="body2">
              이미지 인식, 패턴 분석으로 조사 효율 극대화
            </Typography>
          </Box>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/consultation")}
          >
            무료 상담 신청
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
```

**통합 체크리스트**:

- [ ] HeroGallery 컴포넌트 사용
- [ ] 서비스 소개 섹션
- [ ] 주요 기능 카드
- [ ] CTA 버튼
- [ ] MUI 컴포넌트 활용
- [ ] 반응형 레이아웃

---

### 2.2. 라우팅 업데이트

**packages/frontend/src/App.tsx**:

```tsx
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import PageLayout from "./components/PageLayout";
import HomePage from "./pages/HomePage"; // 추가
import Dashboard from "./pages/Dashboard";
// ... 기타 페이지

const App = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <PageLayout>
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* 변경 */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ... 기타 라우트 */}
        </Routes>
      </PageLayout>
    </Box>
  );
};
```

---

## 🎯 Phase 3: 테마 시스템 통합

### 3.1. MUI 테마 설정

**packages/frontend/src/theme.ts** (업데이트):

```tsx
import { createTheme } from "@mui/material/styles";

// 현재 CSS 변수를 MUI 테마로 변환
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1e40af",
    },
    secondary: {
      main: "#7c3aed",
      light: "#a78bfa",
      dark: "#5b21b6",
    },
    error: {
      main: "#dc2626",
      light: "#f87171",
      dark: "#991b1b",
    },
    success: {
      main: "#059669",
      light: "#10b981",
      dark: "#047857",
    },
    background: {
      default: "#ffffff",
      paper: "#f9fafb",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    fontSize: 16,
  },
  shape: {
    borderRadius: 8,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    secondary: {
      main: "#a78bfa",
      light: "#c4b5fd",
      dark: "#7c3aed",
    },
    error: {
      main: "#f87171",
      light: "#fca5a5",
      dark: "#dc2626",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#111827",
      paper: "#1f2937",
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#9ca3af",
    },
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
});
```

### 3.2. ThemeProvider 래핑

**packages/frontend/src/main.tsx** (업데이트):

```tsx
import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import { useTheme } from "./hooks/useTheme";
import { lightTheme, darkTheme } from "./theme";

const AppWithTheme = () => {
  const { theme } = useTheme();
  const muiTheme = useMemo(
    () => (theme === "dark" ? darkTheme : lightTheme),
    [theme]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithTheme />
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## 🎯 Phase 4: 이미지 자산 이동

### 4.1. 이미지 복사

```bash
# PowerShell 명령어
Copy-Item -Path "탐정사진\탐정사진 기본.png" -Destination "packages\frontend\public\images\"
```

**폴더 구조**:

```
packages/frontend/public/
└── images/
    └── 탐정사진 기본.png
```

**사용 방법**:

```tsx
<img src="/images/탐정사진 기본.png" alt="전문 탐정 서비스" />
```

---

## 🎯 Phase 5: CSS 마이그레이션

### 5.1. 전역 스타일

**packages/frontend/src/index.css** (업데이트):

```css
/* 현재 styles.css의 글로벌 리셋 부분 복사 */
:root {
  /* CSS 변수 유지 (MUI와 병행) */
  --clr-primary: #2563eb;
  --clr-background: #ffffff;
  /* ... */
}

[data-theme="dark"] {
  --clr-primary: #3b82f6;
  --clr-background: #111827;
  /* ... */
}

/* 글로벌 리셋 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  line-height: 1.5;
  color: var(--clr-text);
  background-color: var(--clr-background);
}

/* 포커스 스타일 */
*:focus-visible {
  outline: 3px solid var(--clr-primary);
  outline-offset: 4px;
}

/* Material Icons */
.material-icons-outlined {
  font-family: "Material Icons Outlined";
  font-size: inherit;
  vertical-align: middle;
}
```

### 5.2. CSS Modules

각 컴포넌트별 CSS는 `.module.css`로 분리:

- `AppButton.module.css` (현재 styles.css의 .btn 스타일)
- `HeroGallery.module.css` (hero-gallery, hero-card)
- `Lightbox.module.css` (lightbox\*)

---

## ✅ 최종 체크리스트

### 컴포넌트

- [ ] AppButton 컴포넌트 생성
- [ ] ThemeToggle 컴포넌트 생성
- [ ] HeroGallery 컴포넌트 생성
- [ ] Lightbox 컴포넌트 생성
- [ ] useLightbox Hook 생성
- [ ] useTheme Hook 생성

### 페이지

- [ ] HomePage 생성
- [ ] App.tsx 라우팅 업데이트

### 테마

- [ ] MUI lightTheme 설정
- [ ] MUI darkTheme 설정
- [ ] ThemeProvider 래핑
- [ ] CSS 변수 유지 (하위 호환)

### 자산

- [ ] 이미지 public/images/로 이동
- [ ] Material Icons CDN → npm 패키지 (선택)

### 스타일

- [ ] index.css 글로벌 스타일
- [ ] CSS Modules 분리
- [ ] 접근성 스타일 유지

### 테스트

- [ ] 컴포넌트 단위 테스트 (Jest)
- [ ] 접근성 테스트 (axe-core)
- [ ] 시각적 회귀 테스트 (Chromatic, 선택)

### 문서

- [ ] Storybook 스토리 작성
- [ ] README 업데이트
- [ ] 컴포넌트 API 문서

---

## 🚀 실행 순서

1. **AppButton 먼저** (다른 컴포넌트가 의존)
2. **ThemeToggle** (독립적)
3. **Lightbox** (HeroGallery가 사용)
4. **HeroGallery** (Lightbox 포함)
5. **HomePage** (HeroGallery 사용)
6. **테마 통합** (전역 적용)
7. **테스트 & 문서**

---

## 📝 예상 소요 시간

| 작업                   | 시간                  |
| ---------------------- | --------------------- |
| AppButton 컴포넌트     | 2시간                 |
| ThemeToggle + useTheme | 1시간                 |
| Lightbox + useLightbox | 3시간                 |
| HeroGallery            | 2시간                 |
| HomePage               | 2시간                 |
| 테마 통합              | 2시간                 |
| CSS 마이그레이션       | 2시간                 |
| 테스트 & 문서          | 4시간                 |
| **총계**               | **18시간 (약 2-3일)** |

---

## 🎉 완료 후 결과

### Before (루트 레벨)

```
http://localhost:8080
- 정적 HTML 파일
- 단일 페이지
- Vanilla JS
```

### After (React 앱)

```
http://localhost:5173 (Vite dev server)
- React + TypeScript
- 컴포넌트 재사용
- MUI 통합
- 라우팅
- 상태 관리 준비
```

### 장점

✅ 백엔드 API 연동 준비 완료
✅ 다른 페이지에서 컴포넌트 재사용 가능
✅ TypeScript로 타입 안전성
✅ Storybook으로 디자인 시스템 구축
✅ 테스트 자동화 가능
