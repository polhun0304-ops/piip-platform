import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  Cases: undefined;
  CaseDetail: { id: string };
  Evidence: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "CaseDetail">;

export default function CaseDetailScreen({ route }: Props) {
  const { id } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 사건 상세</Text>

      <View style={styles.card}>
        <Text style={styles.label}>사건 ID</Text>
        <Text style={styles.value}>{id}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>상태</Text>
        <Text style={styles.value}>조사 중</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>설명</Text>
        <Text style={styles.description}>
          여기에 사건에 대한 상세 정보가 표시됩니다. 관련 인물, 증거, 타임라인
          등의 정보를 확인할 수 있습니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#333" },
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
});
