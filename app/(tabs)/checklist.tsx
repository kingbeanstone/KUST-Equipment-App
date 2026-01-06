import React from 'react';
import {
  Alert // 팝업창을 위해 추가
  ,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
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

  // --- [추가] 전체 리셋 함수 ---
  const handleReset = () => {
    Alert.alert(
      "리셋 확인",
      "정말 리셋하시겠습니까?\n모든 체크 상태가 X로 바뀝니다.",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "확인", 
          style: "destructive", // 안드로이드/iOS에서 경고 의미의 빨간색 텍스트 적용
          onPress: () => {
            const resetData = data.map((member) => {
              const updatedMember = { ...member };
              // 모든 장비 키를 순회하며 checked를 false로 변경
              gearKeys.forEach((key) => {
                updatedMember[key] = { ...updatedMember[key], checked: false };
              });
              return updatedMember;
            });
            setData(resetData);
          } 
        },
      ]
    );
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
      {/* 헤더 부분에 리셋 버튼 추가 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✅ 장비 체크 현황</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>초기화</Text>
        </TouchableOpacity>
      </View>

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
  // 헤더 스타일 수정: 양 끝 배치를 위해 flexDirection: 'row' 추가
  header: { 
    padding: 20, 
    backgroundColor: '#28a745', 
    paddingTop: 50, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // 리셋 버튼 스타일
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // 반투명 흰색 배경
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff'
  },
  resetButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
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