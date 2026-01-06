import React from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MemberEquipment, useEquipment } from './_layout';

export default function ChecklistScreen() {
  const { data, setData } = useEquipment();
  const gearKeys: (keyof Omit<MemberEquipment, 'id' | '이름'>)[] = 
    ['가방', 'BCD', '호흡기', '슈트', '마스크', '핀', '부츠', '장갑', '후드', '조끼'];

  const toggleCheck = (id: string, field: string) => {
    setData(data.map((item: any) => {
      if (item.id === id) {
        return { ...item, [field]: { ...item[field], checked: !item[field].checked } };
      }
      return item;
    }));
  };

  const renderItem = ({ item }: { item: MemberEquipment }) => (
    <View style={styles.memberContainer}>
      {/* 첫 번째 행: 입력한 상세 정보 표시 */}
      <View style={styles.infoRow}>
        <View style={[styles.cell, styles.nameCell, styles.infoCellBg]}>
          <Text style={styles.nameText}>{item.이름 || '미입력'}</Text>
        </View>
        {gearKeys.map(key => (
          <View key={key} style={[styles.cell, styles.infoCellBg]}>
            <Text style={styles.infoText} numberOfLines={1}>{item[key].value || '-'}</Text>
          </View>
        ))}
      </View>

      {/* 두 번째 행: O/X 토글 버튼 */}
      <View style={styles.toggleRow}>
        <View style={[styles.cell, styles.nameCell, styles.labelCellBg]}>
          <Text style={styles.labelSubText}>체크</Text>
        </View>
        {gearKeys.map(key => (
          <TouchableOpacity 
            key={key}
            style={[styles.cell, item[key].checked ? styles.checkedCell : styles.uncheckedCell]}
            onPress={() => toggleCheck(item.id, key)}
          >
            <Text style={item[key].checked ? styles.checkedText : styles.uncheckedText}>
              {item[key].checked ? 'O' : 'X'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>✅ 장비 체크 현황 (2줄 1세트)</Text></View>
      <ScrollView horizontal>
        <View>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.headerText, styles.nameCell]}>이름/구분</Text>
            {gearKeys.map(key => <Text key={key} style={styles.headerText}>{key}</Text>)}
          </View>
          <FlatList data={data} renderItem={renderItem} keyExtractor={item => item.id} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, backgroundColor: '#28a745', paddingTop: 50 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  memberContainer: { borderBottomWidth: 2, borderBottomColor: '#dee2e6' },
  infoRow: { flexDirection: 'row' },
  toggleRow: { flexDirection: 'row' },
  row: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  headerText: { width: 70, paddingVertical: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  cell: { width: 70, height: 40, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  nameCell: { width: 90 },
  nameText: { fontWeight: 'bold', fontSize: 13, color: '#333' },
  infoText: { fontSize: 11, color: '#666' },
  labelSubText: { fontSize: 10, color: '#999' },
  infoCellBg: { backgroundColor: '#fff' },
  labelCellBg: { backgroundColor: '#f8f9fa' },
  checkedCell: { backgroundColor: '#d4edda' },
  uncheckedCell: { backgroundColor: '#f8d7da' },
  checkedText: { color: '#155724', fontWeight: 'bold' },
  uncheckedText: { color: '#721c24' },
});