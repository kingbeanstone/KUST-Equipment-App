import { doc, setDoc } from 'firebase/firestore';
import React from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebaseConfig';
import { MemberEquipment, useEquipment } from './_layout';

export default function ChecklistScreen() {
  const { data } = useEquipment();
  
  // 정렬 및 데이터 수정을 위한 키 정의
  const gearKeys: (keyof Omit<MemberEquipment, 'id' | '이름' | 'order'>)[] = 
    ['가방', 'BCD', '호흡기', '슈트', '마스크', '핀', '부츠', '장갑', '후드', '조끼'];

  // 1. 개별 항목 O/X 토글 함수
  const toggleCheck = async (member: MemberEquipment, field: keyof Omit<MemberEquipment, 'id' | '이름' | 'order'>) => {
    try {
      // 기존 데이터 복사 후 해당 필드의 체크 상태만 반전
      const updatedMember = {
        ...member,
        [field]: { 
          ...member[field], 
          checked: !member[field].checked 
        }
      };

      // 파이어베이스 서버에 즉시 업데이트
      await setDoc(doc(db, "members", member.id), updatedMember);
    } catch (e) {
      console.error("체크 업데이트 실패:", e);
    }
  };

  // 2. 전체 리셋 함수 (모든 인원의 체크를 X로)
  const handleResetAll = () => {
    if (data.length === 0) return;

    Alert.alert(
      "전체 리셋",
      "모든 인원의 체크 상태를 X로 초기화하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "리셋", 
          style: "destructive",
          onPress: async () => {
            try {
              const promises = data.map((member: MemberEquipment) => {
                const resetMember = { ...member };
                gearKeys.forEach((key) => {
                  resetMember[key] = { ...resetMember[key], checked: false };
                });
                return setDoc(doc(db, "members", member.id), resetMember);
              });
              
              await Promise.all(promises);
            } catch (e) {
              console.error("리셋 실패:", e);
            }
          } 
        }
      ]
    );
  };

  // 3. 리스트 아이템 렌더링 (2줄 1세트 방식)
  const renderItem = ({ item }: { item: MemberEquipment }) => (
    <View style={styles.memberContainer}>
      {/* 첫 번째 행: 장비 상세 정보 (Read-only) */}
      <View style={styles.infoRow}>
        <View style={[styles.cell, styles.nameCell, styles.infoCellBg]}>
          <Text style={styles.nameText} numberOfLines={1}>{item.이름 || '미입력'}</Text>
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
          <Text style={styles.labelSubText}>체크상태</Text>
        </View>
        {gearKeys.map(key => (
          <TouchableOpacity 
            key={key}
            style={[styles.cell, item[key].checked ? styles.checkedCell : styles.uncheckedCell]}
            onPress={() => toggleCheck(item, key)}
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
      {/* 헤더 및 리셋 버튼 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✅ 장비 체크 현황</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetAll}>
          <Text style={styles.resetButtonText}>전체 리셋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal>
        <View>
          {/* 테이블 헤더 (장비명 라벨) */}
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.headerText, styles.nameCell]}>이름/구분</Text>
            {gearKeys.map(key => <Text key={key} style={styles.headerText}>{key}</Text>)}
          </View>

          {/* 인원별 데이터 리스트 */}
          <FlatList 
            data={data} 
            renderItem={renderItem} 
            keyExtractor={item => item.id}
            removeClippedSubviews={false} // 스크롤 시 깜빡임 방지
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    padding: 20, 
    backgroundColor: '#28a745', 
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fff'
  },
  resetButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  memberContainer: { borderBottomWidth: 2, borderBottomColor: '#dee2e6' },
  infoRow: { flexDirection: 'row' },
  toggleRow: { flexDirection: 'row' },
  row: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  headerText: { width: 70, paddingVertical: 12, textAlign: 'center', fontWeight: 'bold', fontSize: 12, color: '#495057' },
  cell: { width: 70, height: 40, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  nameCell: { width: 90 },
  nameText: { fontWeight: 'bold', fontSize: 13, color: '#333', paddingHorizontal: 5 },
  infoText: { fontSize: 11, color: '#666' },
  labelSubText: { fontSize: 10, color: '#999' },
  infoCellBg: { backgroundColor: '#fff' },
  labelCellBg: { backgroundColor: '#f8f9fa' },
  checkedCell: { backgroundColor: '#d4edda' },
  uncheckedCell: { backgroundColor: '#fff5f5' },
  checkedText: { color: '#28a745', fontWeight: 'bold', fontSize: 16 },
  uncheckedText: { color: '#ff4d4f', fontSize: 16 },
});