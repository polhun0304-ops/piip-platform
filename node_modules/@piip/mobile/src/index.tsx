import { createRoot } from "react-dom/client";
import { AppRegistry } from "react-native-web";
import App from "./App";

// Register the app
AppRegistry.registerComponent("PIIP", () => App);

// Get root element
const rootElement = document.getElementById("root");

if (rootElement) {
  const { element } = AppRegistry.getApplication("PIIP", {});
  const root = createRoot(rootElement);
  root.render(element);
}
