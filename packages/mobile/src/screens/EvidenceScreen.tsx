import { View, Text, FlatList, StyleSheet } from "react-native";

const MOCK = [
  { id: "a", label: "사진 (CCTV)", type: "이미지", date: "2025-01-16" },
  { id: "b", label: "증언 녹취", type: "오디오", date: "2025-01-18" },
  { id: "c", label: "거래 내역", type: "문서", date: "2025-01-22" },
];

export default function EvidenceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 증거 목록</Text>
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemType}>{item.type}</Text>
            </View>
            <Text style={styles.itemDate}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#333" },
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
});
