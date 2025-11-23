import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  Cases: undefined;
  CaseDetail: { id: string };
  Evidence: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 PIIP Mobile — Home</Text>
      <Text style={styles.subtitle}>환영합니다!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Cases")}
      >
        <Text style={styles.buttonText}>📋 사건 목록 보기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => navigation.navigate("Evidence")}
      >
        <Text style={styles.buttonText}>🔍 증거 목록 보기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
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
});
