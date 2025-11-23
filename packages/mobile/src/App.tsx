import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";
import { useCases, useCase } from "./hooks/useCases";
import {
  useEvidence,
  useUploadEvidence,
  useUploadEvidenceByUrl,
} from "./hooks/useEvidence";

const queryClient = new QueryClient();

function CaseDetailScreen({
  caseId,
  onBack,
}: {
  caseId: string;
  onBack: () => void;
}) {
  const { data: caseData, isLoading, error } = useCase(caseId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>사건 상세</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>사건 상세</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            오류 발생: {(error as Error).message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사건 상세</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>📄 {caseData?.title}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>사건 ID</Text>
          <Text style={styles.value}>{caseData?.id}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>상태</Text>
          <Text style={styles.value}>{caseData?.status}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>등록일</Text>
          <Text style={styles.value}>{caseData?.date}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>설명</Text>
          <Text style={styles.description}>
            {caseData?.description || "설명이 없습니다."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function CaseListScreen({
  onSelectCase,
  onBack,
}: {
  onSelectCase: (id: string) => void;
  onBack: () => void;
}) {
  const { data: cases, isLoading, error } = useCases();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>사건 목록</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>사건 목록 로딩 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>사건 목록</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            오류 발생: {(error as Error).message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사건 목록</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>📋 사건 목록 ({cases?.length || 0}건)</Text>
        {cases?.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.row}
            onPress={() => onSelectCase(item.id)}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDate}>
                {item.date} · {item.status}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function EvidenceScreen({ onBack }: { onBack: () => void }) {
  const { data: evidence, isLoading, error } = useEvidence();
  const uploadMutation = useUploadEvidence();
  const uploadUrlMutation = useUploadEvidenceByUrl();
  const [label, setLabel] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlText, setUrlText] = useState("");

  console.log("EvidenceScreen:", { evidence, isLoading, error });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>증거 목록</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>증거 목록 로딩 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>증거 목록</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            오류 발생: {(error as Error).message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>증거 목록</Text>
      </View>

      <View style={styles.content}>
        {/* 업로드 섹션 (웹) */}
        {Platform.OS === "web" && (
          <View style={styles.uploadCard}>
            <Text style={styles.uploadTitle}>📤 증거 업로드</Text>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.inputLabel}>라벨</Text>
              <TextInput
                placeholder="예: CCTV 사진"
                value={label}
                onChangeText={setLabel}
                style={styles.input}
              />
            </View>
            <input
              type="file"
              accept="image/*,audio/*,video/*,application/*,text/*"
              aria-label="증거 파일 선택"
              title="증거 파일 선택"
              onChange={(e) => {
                const f = (e.target as HTMLInputElement).files?.[0] || null;
                setSelectedFile(f);
              }}
            />
            <TouchableOpacity
              style={[
                styles.button,
                uploadMutation.isLoading && { opacity: 0.6 },
              ]}
              onPress={() => {
                if (!selectedFile) return;
                uploadMutation.mutate({
                  file: selectedFile,
                  label: label || selectedFile.name,
                });
                // reset UI (낙관적)
                setLabel("");
                (
                  document.querySelector(
                    'input[type="file"]'
                  ) as HTMLInputElement | null
                )?.value &&
                  ((
                    document.querySelector(
                      'input[type="file"]'
                    ) as HTMLInputElement
                  ).value = "");
                setSelectedFile(null);
              }}
              disabled={!selectedFile || uploadMutation.isLoading}
            >
              <Text style={styles.buttonText}>
                {uploadMutation.isLoading ? "업로드 중..." : "업로드"}
              </Text>
            </TouchableOpacity>
            {uploadMutation.isError && (
              <Text style={styles.errorText}>
                업로드 실패: {(uploadMutation.error as Error)?.message}
              </Text>
            )}
            <View style={{ marginTop: 16 }}>
              <Text style={styles.inputLabel}>URL로 업로드</Text>
              <TextInput
                placeholder="https://..."
                value={urlText}
                onChangeText={setUrlText}
                style={styles.input}
              />
              <TouchableOpacity
                style={[
                  styles.button,
                  { marginTop: 10 },
                  uploadUrlMutation.isLoading && { opacity: 0.6 },
                ]}
                onPress={() => {
                  if (!urlText) return;
                  uploadUrlMutation.mutate({
                    url: urlText,
                    label: label || undefined,
                  });
                  setUrlText("");
                }}
                disabled={!urlText || uploadUrlMutation.isLoading}
              >
                <Text style={styles.buttonText}>
                  {uploadUrlMutation.isLoading
                    ? "가져오는 중..."
                    : "URL에서 가져오기"}
                </Text>
              </TouchableOpacity>
              {uploadUrlMutation.isError && (
                <Text style={styles.errorText}>
                  URL 업로드 실패: {(uploadUrlMutation.error as Error)?.message}
                </Text>
              )}
            </View>
          </View>
        )}
        <Text style={styles.title}>
          🔍 증거 목록 ({evidence?.length || 0}건)
        </Text>
        {!evidence || evidence.length === 0 ? (
          <Text style={{ padding: 20, textAlign: "center", color: "#666" }}>
            증거가 없습니다.
          </Text>
        ) : (
          evidence.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemType}>{item.type}</Text>
              </View>
              <Text style={styles.itemDate}>{item.date}</Text>
              {item.filePath &&
                (Platform.OS === "web" ? (
                  // 웹에서는 링크로 열기
                  <a
                    href={`http://localhost:4000${item.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    파일 열기
                  </a>
                ) : (
                  <Text style={{ color: "#1e88e5", marginTop: 6 }}>
                    파일: {item.filePath}
                  </Text>
                ))}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<"home" | "cases" | "evidence">("home");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  if (screen === "cases" && selectedCase) {
    return (
      <CaseDetailScreen
        caseId={selectedCase}
        onBack={() => setSelectedCase(null)}
      />
    );
  }

  if (screen === "cases") {
    return (
      <CaseListScreen
        onSelectCase={(id) => setSelectedCase(id)}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "evidence") {
    return <EvidenceScreen onBack={() => setScreen("home")} />;
  }

  // Home screen
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PIIP Mobile</Text>
      </View>

      <View style={styles.homeContent}>
        <Text style={styles.homeTitle}>🏠 PIIP Mobile — Home</Text>
        <Text style={styles.subtitle}>환영합니다!</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setScreen("cases")}
        >
          <Text style={styles.buttonText}>📋 사건 목록 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => setScreen("evidence")}
        >
          <Text style={styles.buttonText}>🔍 증거 목록 보기</Text>
        </TouchableOpacity>

        {Platform.OS === "web" && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#9c27b0" }]}
            onPress={() => {
              const room = `piip-room-${Date.now()}`;
              const id = `user-${Math.floor(Math.random() * 1000)}`;
              window.open(
                `http://localhost:4000/public/twilio.html?room=${encodeURIComponent(room)}&id=${encodeURIComponent(id)}`,
                "_blank"
              );
            }}
          >
            <Text style={styles.buttonText}>📞 통화(웹 베타) 열기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#2196f3",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    color: "#fff",
    fontSize: 18,
    marginRight: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  homeContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  homeTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#2196f3",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    minWidth: 250,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#4caf50",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafafa",
    marginBottom: 8,
    borderRadius: 8,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  rowDate: {
    fontSize: 14,
    color: "#666",
  },
  arrow: {
    fontSize: 24,
    color: "#999",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2196f3",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fafafa",
    marginBottom: 8,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemType: {
    fontSize: 12,
    color: "#2196f3",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemDate: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
  },
  uploadCard: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}
