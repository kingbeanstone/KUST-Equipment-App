import { doc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InputHeader } from '../../components/InputHeader';
import { db } from '../../firebaseConfig';
import { GearStatus, MemberEquipment, useEquipment } from './_layout';

// [1. 체크리스트 디자인 규격 동기화]
const COL_WIDTH = 70;      //
const NAME_WIDTH = 90;     //
const NO_WIDTH = 50;       
const ROW_HEIGHT = 40;     //

// [2. 중앙 정렬의 끝판왕: EditableCell]
const EditableCell = ({ value, onUpdate, style, isSortMode, fontSize = 11 }: any) => {
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);

  return (
    <View pointerEvents={isSortMode ? "none" : "auto"} style={[localStyles.cell, style]}>
      <TextInput 
        style={[localStyles.input, { fontSize }]} 
        value={v} 
        onChangeText={setV} 
        onEndEditing={() => onUpdate(v)} 
        placeholder="-" 
        placeholderTextColor="#ccc" 
        
        // --- 중앙 정렬을 위한 핵심 속성들 ---
        textAlign="center"         // 가로 중앙
        textAlignVertical="center" // 세로 중앙 (안드로이드 전용)
        //padding={0}                // 모든 방향 여백 제거
        //includeFontPadding={false} // 폰트 상단 불필요한 패딩 제거
        underlineColorAndroid="transparent" // 안드로이드 밑줄 제거
      />
    </View>
  );
};

export default function InputScreen() {
  const { data, setData } = useEquipment();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isSortMode, setIsSortMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const gearKeys: (keyof Omit<MemberEquipment, 'id' | '이름' | 'order'>)[] = 
    ['가방', 'BCD', '호흡기', '슈트', '마스크', '핀', '부츠', '장갑', '후드', '조끼'];

  const updateDetail = async (id: string, field: string, text: string) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        if (field === '이름') return { ...item, 이름: text };
        return { ...item, [field]: { ...item[field as keyof MemberEquipment] as GearStatus, value: text } };
      }
      return item;
    }));
    const target = data.find(d => d.id === id);
    if (target) {
      const updatedObj = field === '이름' 
        ? { ...target, 이름: text } 
        : { ...target, [field]: { ...(target[field as keyof MemberEquipment] as GearStatus), value: text } };
      await setDoc(doc(db, "members", id), updatedObj);
    }
  };

  const renderItem = ({ item, index }: { item: MemberEquipment, index: number }) => (
    <View style={localStyles.row}>
      <View style={[localStyles.cell, { width: NO_WIDTH, backgroundColor: '#f8f9fa' }]}>
        <Text style={localStyles.noText}>{index + 1}</Text>
      </View>
      {isSortMode && (
        <View style={[localStyles.cell, { width: 60, backgroundColor: '#fff5f5' }]}>
          <Text style={{ fontSize: 11, color: '#ff4d4f', fontWeight: 'bold' }}>고정</Text>
        </View>
      )}
      {isDeleteMode && (
        <TouchableOpacity 
          style={[localStyles.cell, { width: 50 }]} 
          onPress={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}
        >
          <View style={[localStyles.circle, selectedIds.includes(item.id) && localStyles.circleSelected]} />
        </TouchableOpacity>
      )}
      <EditableCell 
        style={{ width: NAME_WIDTH }} 
        value={item.이름} 
        onUpdate={(val: string) => updateDetail(item.id, '이름', val)} 
        isSortMode={isSortMode} 
        fontSize={13} //
      />
      {gearKeys.map(key => (
        <EditableCell
          key={key}
          style={{ width: COL_WIDTH }}
          value={(item[key] as GearStatus).value}
          onUpdate={(val: string) => updateDetail(item.id, key, val)}
          isSortMode={isSortMode}
          fontSize={11} //
        />
      ))}
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <InputHeader 
          isDeleteMode={isDeleteMode} isSortMode={isSortMode} selectedCount={selectedIds.length}
          onAddRow={() => {}} onToggleDelete={(m) => {setIsDeleteMode(m); setSelectedIds([]);}}
          onToggleSort={setIsSortMode} onBulkDelete={() => {}} 
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={{ width: isSortMode ? 1000 : 940 }}>
            <View style={localStyles.tableHeader}>
              <View style={[localStyles.headerCell, { width: NO_WIDTH }]}><Text style={localStyles.headerText}>No.</Text></View>
              {isSortMode && <View style={[localStyles.headerCell, { width: 60 }]}><Text style={localStyles.headerText}>상태</Text></View>}
              {isDeleteMode && <View style={[localStyles.headerCell, { width: 50 }]}><Text style={localStyles.headerText}>선택</Text></View>}
              <View style={[localStyles.headerCell, { width: NAME_WIDTH }]}><Text style={localStyles.headerText}>이름/구분</Text></View>
              {gearKeys.map(key => (
                <View key={key} style={[localStyles.headerCell, { width: COL_WIDTH }]}><Text style={localStyles.headerText}>{key}</Text></View>
              ))}
            </View>
            <FlatList
              data={data}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={true}
              style={{ flex: 1, ...Platform.select({ web: { overflowY: 'auto' } as any }) }}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const localStyles = StyleSheet.create({
  //와 동일한 border 색상 사용
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  headerCell: { justifyContent: 'center', alignItems: 'center', height: 40 }, 
  headerText: { fontWeight: 'bold', fontSize: 12, color: '#495057' },
  cell: { 
    height: ROW_HEIGHT, 
    justifyContent: 'center', // 세로 중앙
    alignItems: 'center',     // 가로 중앙
    borderRightWidth: 1, 
    borderRightColor: '#eee' 
  },
  input: { 
    width: '100%', 
    height: '100%', 
    color: '#333', 
    padding: 0, 
    textAlign: 'center',
    // 웹 브라우저에서 TextInput 정중앙 정렬을 위한 높이 설정
    ...Platform.select({
      web: { outlineStyle: 'none', lineHeight: ROW_HEIGHT } as any
    })
  },
  noText: { fontSize: 12, color: '#999', fontWeight: 'bold' },
  circle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#ccc' },
  circleSelected: { backgroundColor: '#17a2b8', borderColor: '#17a2b8' },
});