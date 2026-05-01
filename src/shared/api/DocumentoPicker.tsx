import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DocumentoPickerProps {
  value?: string | null;
  onChange: (uri: string, name: string) => void;
  onClear: () => void;
}

export function DocumentoPicker({
  value,
  onChange,
  onClear,
}: DocumentoPickerProps) {
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setFileName(asset.name);
      onChange(asset.uri, asset.name);
    }
  };

  const handleClear = () => {
    setFileName(null);
    onClear();
  };

  const currentFileName = fileName || (value ? "Documento existente" : null);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePickDocument}>
        <Feather name="file-text" size={20} color="#0033A0" />
        <Text style={styles.buttonText}>Seleccionar PDF</Text>
      </TouchableOpacity>
      {currentFileName && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {currentFileName}
          </Text>
          <TouchableOpacity onPress={handleClear}>
            <Feather name="x" size={20} color="#C41230" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFF",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  buttonText: { marginLeft: 8, color: "#0033A0", fontWeight: "500" },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  fileName: { flex: 1, color: "#374151", marginRight: 8 },
});
