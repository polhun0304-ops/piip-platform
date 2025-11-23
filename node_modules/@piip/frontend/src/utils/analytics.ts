// 간단한 이벤트 트래킹 유틸리티 (Google Analytics, Mixpanel 등 연동 가능)

export function trackEvent(category: string, action: string, label?: string, value?: number) {
  if ((window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
  // Mixpanel 등 추가 가능
}

export function trackABTest(testName: string, variant: string) {
  if ((window as any).gtag) {
    (window as any).gtag('event', 'ab_test', {
      event_category: 'A/B Test',
      event_label: `${testName}:${variant}`,
    });
  }
}
