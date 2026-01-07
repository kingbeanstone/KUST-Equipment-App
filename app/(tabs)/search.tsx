import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MemberEquipment, useEquipment } from './_layout';

export default function SearchScreen() {
  const { data } = useEquipment();
  // 현재 어떤 장비로 정렬 중인지 저장 (가방, BCD, 호흡기 중 하나)
  const [sortKey, setSortKey] = useState<string | null>(null);

  // 정렬 로직: 데이터가 바뀌거나 sortKey가 바뀔 때만 계산 (useMemo 사용)
  const sortedData = useMemo(() => {
    if (!sortKey) return [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return [...data].sort((a, b) => {
      const valA = (a[sortKey as keyof MemberEquipment] as any).value || "";
      const valB = (b[sortKey as keyof MemberEquipment] as any).value || "";
      
      // 한글/영문 오름차순 정렬
      return valA.localeCompare(valB, 'ko', { sensitivity: 'base' });
    });
  }, [data, sortKey]);

  const renderItem = ({ item }: { item: MemberEquipment }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.nameCell]}>{item.이름 || '(미입력)'}</Text>
      <Text style={[styles.cell, sortKey === '가방' && styles.activeCell]}>{item.가방.value || '-'}</Text>
      <Text style={[styles.cell, sortKey === 'BCD' && styles.activeCell]}>{item.BCD.value || '-'}</Text>
      <Text style={[styles.cell, sortKey === '호흡기' && styles.activeCell]}>{item.호흡기.value || '-'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 영역 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}> 장비별 정렬 보기</Text>
      </View>

      {/* 정렬 버튼 영역 */}
      <View style={styles.buttonContainer}>
        {['가방', 'BCD', '호흡기'].map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.sortButton, sortKey === key && styles.sortButtonActive]}
            onPress={() => setSortKey(sortKey === key ? null : key)} // 같은 버튼 누르면 정렬 해제
          >
            <Text style={[styles.sortButtonText, sortKey === key && styles.sortButtonTextActive]}>
              {key}순 정렬
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal>
        <View>
          {/* 테이블 헤더 */}
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.headerText, styles.nameCell]}>이름</Text>
            <Text style={styles.headerText}>가방</Text>
            <Text style={styles.headerText}>BCD</Text>
            <Text style={styles.headerText}>호흡기</Text>
          </View>

          {/* 리스트 */}
          <FlatList
            data={sortedData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, backgroundColor: '#17a2b8', paddingTop: 50 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonContainer: { 
    flexDirection: 'row', 
    padding: 15, 
    justifyContent: 'space-around', 
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  sortButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#17a2b8',
    backgroundColor: '#fff'
  },
  sortButtonActive: { backgroundColor: '#17a2b8' },
  sortButtonText: { color: '#17a2b8', fontWeight: 'bold', fontSize: 13 },
  sortButtonTextActive: { color: '#fff' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableHeader: { backgroundColor: '#e9ecef' },
  headerText: { width: 85, paddingVertical: 12, textAlign: 'center', fontWeight: 'bold', color: '#495057' },
  cell: { width: 85, paddingVertical: 15, textAlign: 'center', color: '#333' },
  nameCell: { width: 100, backgroundColor: '#f8f9fa', fontWeight: 'bold' },
  activeCell: { backgroundColor: '#e3f2fd', fontWeight: 'bold', color: '#007AFF' }
});