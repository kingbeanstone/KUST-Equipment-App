import { doc, setDoc, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { InputHeader } from '../../components/InputHeader';
import { db } from '../../firebaseConfig';
import { GearStatus, MemberEquipment, useEquipment } from './_layout';

const COL_WIDTH = 70;      
const NAME_WIDTH = 90;     
const NO_WIDTH = 50;       
const DELETE_COL_WIDTH = 50; 
const SORT_COL_WIDTH = 50;   
const ROW_HEIGHT = 40;     

// [하이브리드 입력 셀] - isEditMode 로직 복구
const EditableCell = ({ value, onUpdate, style, isEditMode, fontSize = 11 }: any) => {
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);

  return (
    <View 
      /* 수정 모드가 아닐 때는 터치 이벤트를 무시하여 스크롤 최적화 */
      pointerEvents={isEditMode ? "auto" : "none"}
      style={[localStyles.cell, style]}
    >
      <TextInput 
        style={[
          localStyles.input, 
          { 
            fontSize, 
            backgroundColor: isEditMode ? '#f0f8ff' : 'transparent', // 수정 모드일 때 하늘색 배경
          }
        ]} 
        value={v} 
        onChangeText={setV} 
        onEndEditing={() => onUpdate(v)} 
        placeholder="-" 
        placeholderTextColor="#ccc" 
        textAlign="center"
        editable={isEditMode} // 수정 모드일 때만 활성화
      />
    </View>
  );
};

export default function InputScreen() {
  const { data, setData } = useEquipment();
  const [isEditMode, setIsEditMode] = useState(false);   // 텍스트 수정 모드
  const [isSortMode, setIsSortMode] = useState(false);   // 행 정렬 모드
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const gearKeys: (keyof Omit<MemberEquipment, 'id' | '이름' | 'order'>)[] = 
    ['가방', 'BCD', '호흡기', '슈트', '마스크', '핀', '부츠', '장갑', '후드', '조끼'];

  // --- [로직: 드래그 종료 시 순서 저장] ---
  const handleDragEnd = async (newData: MemberEquipment[]) => {
    const updatedData = newData.map((item, index) => ({ ...item, order: index }));
    setData(updatedData);

    try {
      const batch = writeBatch(db);
      updatedData.forEach((item) => {
        batch.update(doc(db, "members", item.id), { order: item.order });
      });
      await batch.commit();
    } catch (e) {
      console.error("순서 저장 실패:", e);
    }
  };

  // --- [기존 추가/수정/삭제 로직 유지] ---
  const addRow = async () => {
    const createEmptyGear = (): GearStatus => ({ value: '', checked: false });
    const newId = Date.now().toString();
    const newRow: MemberEquipment = {
      id: newId, 이름: '', order: data.length,
      가방: createEmptyGear(), BCD: createEmptyGear(), 호흡기: createEmptyGear(), 슈트: createEmptyGear(),
      마스크: createEmptyGear(), 핀: createEmptyGear(), 부츠: createEmptyGear(), 장갑: createEmptyGear(),
      후드: createEmptyGear(), 조끼: createEmptyGear()
    };
    setData(prev => [...prev, newRow]);
    await setDoc(doc(db, "members", newId), newRow);
  };

  const updateDetail = async (id: string, field: string, text: string) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        if (field === '이름') return { ...item, 이름: text };
        const key = field as keyof Omit<MemberEquipment, 'id' | '이름' | 'order'>;
        return { ...item, [key]: { ...item[key], value: text } };
      }
      return item;
    }));
    // DB 업데이트 로직 (생략)
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<MemberEquipment>) => {
    const isSelected = selectedIds.includes(item.id);
    const index = getIndex();

    return (
      <ScaleDecorator>
        <View style={[
          localStyles.row, 
          isSelected && { backgroundColor: '#fff5f5' },
          isActive && { backgroundColor: '#f8f9fa', elevation: 4 }
        ]}>
          {/* [1] 정렬 모드 핸들: 정렬 버튼 눌렀을 때만 나타남 */}
          {isSortMode && (
            <TouchableOpacity 
              style={[localStyles.cell, { width: SORT_COL_WIDTH, backgroundColor: '#f1f3f5' }]} 
              onPressIn={drag} 
              delayLongPress={0}
            >
              <Text style={{ fontSize: 20, color: '#adb5bd' }}>≡</Text>
            </TouchableOpacity>
          )}

          {/* [2] 삭제 모드 체크박스 */}
          {isDeleteMode && (
            <TouchableOpacity 
              style={[localStyles.cell, { width: DELETE_COL_WIDTH }]} 
              onPress={() => setSelectedIds(prev => 
                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
              )}
            >
              <View style={[localStyles.circle, isSelected && localStyles.circleSelected]}>
                {isSelected && <View style={localStyles.innerCircle} />}
              </View>
            </TouchableOpacity>
          )}

          <View style={[localStyles.cell, { width: NO_WIDTH, backgroundColor: '#f8f9fa' }]}>
            <Text style={localStyles.noText}>{(index ?? 0) + 1}</Text>
          </View>

          <EditableCell 
            style={{ width: NAME_WIDTH }} 
            value={item.이름} 
            onUpdate={(val: string) => updateDetail(item.id, '이름', val)} 
            isEditMode={isEditMode} // 수정 모드 상태 전달
            fontSize={13}
          />

          {gearKeys.map(key => (
            <EditableCell
              key={key}
              style={{ width: COL_WIDTH }}
              value={(item[key] as GearStatus).value}
              onUpdate={(val: string) => updateDetail(item.id, key, val)}
              isEditMode={isEditMode} // 수정 모드 상태 전달
              fontSize={11}
            />
          ))}
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <InputHeader 
          isDeleteMode={isDeleteMode} 
          isSortMode={isSortMode} // 정렬 상태
          isEditMode={isEditMode} // 수정 상태 (Header 컴포넌트에도 props 추가 필요)
          selectedCount={selectedIds.length}
          onAddRow={addRow}
          onToggleDelete={(m) => { setIsDeleteMode(m); setSelectedIds([]); setIsSortMode(false); setIsEditMode(false); }}
          onToggleSort={(m) => { setIsSortMode(m); setIsDeleteMode(false); setIsEditMode(false); }}
          onToggleEdit={(m) => { setIsEditMode(m); setIsSortMode(false); setIsDeleteMode(false); }}
          onBulkDelete={() => {}} 
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={{ 
            width: 940 + (isDeleteMode ? DELETE_COL_WIDTH : 0) + (isSortMode ? SORT_COL_WIDTH : 0) 
          }}>
            {/* 테이블 헤더 */}
            <View style={localStyles.tableHeader}>
              {isSortMode && <View style={[localStyles.headerCell, { width: SORT_COL_WIDTH }]}><Text style={localStyles.headerText}>정렬</Text></View>}
              {isDeleteMode && <View style={[localStyles.headerCell, { width: DELETE_COL_WIDTH }]}><Text style={localStyles.headerText}>선택</Text></View>}
              <View style={[localStyles.headerCell, { width: NO_WIDTH }]}><Text style={localStyles.headerText}>No.</Text></View>
              <View style={[localStyles.headerCell, { width: NAME_WIDTH }]}><Text style={localStyles.headerText}>이름/구분</Text></View>
              {gearKeys.map(key => (
                <View key={key} style={[localStyles.headerCell, { width: COL_WIDTH }]}><Text style={localStyles.headerText}>{key}</Text></View>
              ))}
            </View>

            <DraggableFlatList
              data={data}
              keyExtractor={item => item.id}
              onDragEnd={({ data }) => handleDragEnd(data)}
              renderItem={renderItem}
              // 정렬 모드일 때만 드래그 활성화, 수정 모드일 때는 드래그 비활성화
              dragItemOverflow={true}
              activationDistance={20}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const localStyles = StyleSheet.create({
  // 기존 스타일 유지
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#dee2e6', backgroundColor: '#fff' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  headerCell: { justifyContent: 'center', alignItems: 'center', height: 40 }, 
  headerText: { fontWeight: 'bold', fontSize: 12, color: '#495057' },
  cell: { height: ROW_HEIGHT, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  input: { width: '100%', height: '100%', color: '#333', padding: 0, textAlign: 'center' },
  noText: { fontSize: 12, color: '#adb5bd', fontWeight: 'bold' },
  circle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  circleSelected: { borderColor: '#dc3545', backgroundColor: '#dc3545' },
  innerCircle: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});