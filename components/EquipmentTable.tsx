import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { MemberEquipment } from '../app/(tabs)/_layout';
import { styles } from '../styles/InputScreenStyles';

// --- [1. 한글 씹힘 방지 전용 입력 컴포넌트] ---
const EditableCell = ({ value, onUpdate, style, placeholder }: {
  value: string;
  onUpdate: (text: string) => void;
  style: any;
  placeholder?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);

  // 외부(DB)에서 값이 바뀌었을 때만 로컬 상태를 동기화
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <TextInput
      style={style}
      value={localValue}
      onChangeText={setLocalValue} // 입력 중에는 로컬 상태만 변경 (전체 리렌더링 방지)
      onEndEditing={() => onUpdate(localValue)} // 입력을 마치고 칸을 옮길 때 DB 저장
      placeholder={placeholder}
      placeholderTextColor="#ccc"
    />
  );
};

// --- [2. 메인 테이블 컴포넌트] ---
interface Props {
  data: MemberEquipment[];
  setData: (data: MemberEquipment[]) => void;
  isSortMode: boolean;
  isDeleteMode: boolean;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onUpdate: (id: string, field: string, text: string) => void;
}

export const EquipmentTable = ({ 
  data, setData, isSortMode, isDeleteMode, 
  selectedIds, onSelect, onUpdate 
}: Props) => {
  
  const gearKeys: (keyof Omit<MemberEquipment, 'id' | '이름' | 'order'>)[] = 
    ['가방', 'BCD', '호흡기', '슈트', '마스크', '핀', '부츠', '장갑', '후드', '조끼'];

  const renderItem = ({ item, drag, isActive }: RenderItemParams<MemberEquipment>) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <ScaleDecorator>
        <View style={[styles.row, isActive && { backgroundColor: '#e9ecef', elevation: 5 }]}>
          {/* 정렬 모드: 드래그 핸들 */}
          {isSortMode && (
            <TouchableOpacity 
              style={styles.sortColumn} 
              onPressIn={drag} // onPressIn으로 즉각 반응하게 설정
              activeOpacity={0.7}
            >
              <Text style={styles.sortHandleText}>☰ 드래그</Text>
            </TouchableOpacity>
          )}

          {/* 삭제 모드: 선택 서클 */}
          {isDeleteMode && (
            <TouchableOpacity style={styles.selectColumn} onPress={() => onSelect(item.id)}>
              <View style={[styles.circleToggle, isSelected && styles.circleSelected]}>
                {isSelected && <View style={styles.innerCircle} />}
              </View>
            </TouchableOpacity>
          )}

          {/* 이름 입력 셀 (한글 방지 적용) */}
          <EditableCell 
            style={[styles.cell, styles.nameCell]}
            value={item.이름}
            onUpdate={(val) => onUpdate(item.id, '이름', val)}
            placeholder="이름"
          />

          {/* 장비별 입력 셀 (한글 방지 적용) */}
          {gearKeys.map(key => (
            <EditableCell
              key={key}
              style={styles.cell}
              value={item[key].value}
              onUpdate={(val) => onUpdate(item.id, key, val)}
              placeholder="-"
            />
          ))}
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <ScrollView horizontal contentContainerStyle={{ flexDirection: 'column' }}>
      {/* 테이블 헤더 영역 */}
      <View style={[styles.row, styles.tableHeader]}>
        {isSortMode && <View style={styles.sortColumn}><Text style={styles.headerText}>순서</Text></View>}
        {isDeleteMode && <View style={styles.selectColumn}><Text style={styles.headerText}>선택</Text></View>}
        <Text style={[styles.headerText, styles.nameCell]}>이름</Text>
        {gearKeys.map(key => <Text key={key} style={styles.headerText}>{key}</Text>)}
      </View>

      {/* 드래그 가능한 리스트 본체 */}
      <DraggableFlatList 
        data={data} 
        onDragEnd={({ data: newData }) => setData(newData)} 
        keyExtractor={item => item.id} 
        renderItem={renderItem} 
        scrollEnabled={false} // 가로 스크롤과 충돌 방지를 위해 false
        activationDistance={5} // 드래그 감도 조절
      />
    </ScrollView>
  );
};