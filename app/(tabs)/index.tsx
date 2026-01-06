import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GearStatus, MemberEquipment, useEquipment } from './_layout';

export default function InputScreen() {
  const { data, setData } = useEquipment();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isSortMode, setIsSortMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const gearKeys: (keyof Omit<MemberEquipment, 'id' | '이름'>)[] = 
    ['가방', 'BCD', '호흡기', '슈트', '마스크', '핀', '부츠', '장갑', '후드', '조끼'];

  const addRow = () => {
    const createEmptyGear = (): GearStatus => ({ value: '', checked: false });
    const newRow: MemberEquipment = {
      id: Date.now().toString(),
      이름: '',
      가방: createEmptyGear(), BCD: createEmptyGear(), 호흡기: createEmptyGear(),
      슈트: createEmptyGear(), 마스크: createEmptyGear(), 핀: createEmptyGear(),
      부츠: createEmptyGear(), 장갑: createEmptyGear(), 후드: createEmptyGear(), 조끼: createEmptyGear()
    };
    setData([...data, newRow]);
  };

  const updateDetail = (id: string, field: string, text: string) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        if (field === '이름') return { ...item, 이름: text };
        const key = field as keyof Omit<MemberEquipment, 'id' | '이름'>;
        return { ...item, [key]: { ...item[key], value: text } };
      }
      return item;
    }));
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<MemberEquipment>) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <ScaleDecorator>
        <View style={[styles.row, isActive && { backgroundColor: '#e9ecef' }]}>
          {isSortMode && (
            <TouchableOpacity style={styles.sortColumn} onLongPress={drag} delayLongPress={0}>
              <Text style={styles.sortHandleText}>≡ 드래그</Text>
            </TouchableOpacity>
          )}
          {isDeleteMode && (
            <TouchableOpacity 
              style={styles.selectColumn} 
              onPress={() => setSelectedIds(prev => isSelected ? prev.filter(id => id !== item.id) : [...prev, item.id])}
            >
              <View style={[styles.circleToggle, isSelected && styles.circleSelected]}>
                {isSelected && <View style={styles.innerCircle} />}
              </View>
            </TouchableOpacity>
          )}
          <TextInput 
            style={[styles.cell, styles.nameCell]} 
            value={item.이름} 
            onChangeText={(v) => updateDetail(item.id, '이름', v)} 
            placeholder="이름"
            placeholderTextColor="#ccc"
          />
          {gearKeys.map(key => (
            <TextInput 
              key={key} 
              style={styles.cell} 
              value={item[key].value} 
              onChangeText={(v) => updateDetail(item.id, key, v)} 
              placeholder="-"
              placeholderTextColor="#ccc"
            />
          ))}
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✍️ KUST 장비 입력</Text>
          <View style={styles.headerButtons}>
            {!isDeleteMode && (
              <TouchableOpacity 
                style={[styles.addButton, { marginRight: 8, backgroundColor: isSortMode ? '#212529' : '#fff' }]} 
                onPress={() => setIsSortMode(!isSortMode)}
              >
                <Text style={{ color: isSortMode ? '#fff' : '#007AFF', fontWeight: 'bold' }}>{isSortMode ? '완료' : '정렬'}</Text>
              </TouchableOpacity>
            )}
            {!isSortMode && (
              !isDeleteMode ? (
                <>
                  <TouchableOpacity style={styles.addButton} onPress={addRow}><Text style={styles.addButtonText}>+ 추가</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.addButton, { marginLeft: 8, backgroundColor: '#ff4d4f' }]} onPress={() => setIsDeleteMode(true)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>삭제</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.addButton} onPress={() => { setIsDeleteMode(false); setSelectedIds([]); }}><Text style={{ color: '#666' }}>취소</Text></TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.addButton, { marginLeft: 8, backgroundColor: '#ff4d4f' }]} 
                    onPress={() => {
                      Alert.alert("삭제", `${selectedIds.length}명을 삭제하시겠습니까?`, [
                        { text: "취소" },
                        { text: "삭제", onPress: () => {
                            setData(prev => prev.filter(i => !selectedIds.includes(i.id)));
                            setSelectedIds([]);
                            setIsDeleteMode(false);
                        }}
                      ]);
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>삭제 완료({selectedIds.length})</Text>
                  </TouchableOpacity>
                </>
              )
            )}
          </View>
        </View>

        <ScrollView horizontal contentContainerStyle={{ flexDirection: 'column' }}>
          <View style={[styles.row, styles.tableHeader]}>
            {isSortMode && <View style={styles.sortColumn}><Text style={styles.headerText}>순서</Text></View>}
            {isDeleteMode && <View style={styles.selectColumn}><Text style={styles.headerText}>선택</Text></View>}
            <Text style={[styles.headerText, styles.nameCell]}>이름</Text>
            {gearKeys.map(key => <Text key={key} style={styles.headerText}>{key}</Text>)}
          </View>
          <DraggableFlatList data={data} onDragEnd={({ data }) => setData(data)} keyExtractor={item => item.id} renderItem={renderItem} scrollEnabled={false} />
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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