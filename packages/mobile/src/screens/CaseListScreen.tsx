import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  Cases: undefined;
  CaseDetail: { id: string };
  Evidence: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Cases">;

const MOCK = [
  { id: "1", title: "사건 #1: 도난 사건", date: "2025-01-15" },
  { id: "2", title: "사건 #2: 사기 의혹", date: "2025-01-20" },
  { id: "3", title: "사건 #3: 분쟁", date: "2025-02-01" },
];

export default function CaseListScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 사건 목록</Text>
      <FlatList
        data={MOCK}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("CaseDetail", { id: item.id })}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDate}>{item.date}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#333" },
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
});
