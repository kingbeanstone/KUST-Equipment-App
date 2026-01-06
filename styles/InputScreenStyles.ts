import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, backgroundColor: '#007AFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row' },
  addButton: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  addButtonText: { color: '#007AFF', fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  tableHeader: { backgroundColor: '#f1f3f5' },
  headerText: { width: 70, paddingVertical: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 12, color: '#495057' },
  cell: { width: 70, height: 45, textAlign: 'center', textAlignVertical: 'center', fontSize: 12, borderRightWidth: 1, borderRightColor: '#f1f3f5', color: '#212529', padding: 0 },
  nameCell: { width: 90, backgroundColor: '#f8f9fa' },
  sortColumn: { width: 120, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#f1f3f5', backgroundColor: '#f8f9fa' },
  sortHandleText: { fontSize: 14, color: '#adb5bd', fontWeight: 'bold' },
  selectColumn: { width: 50, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#f1f3f5' },
  circleToggle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  circleSelected: { borderColor: '#ff4d4f' },
  innerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff4d4f' },
});