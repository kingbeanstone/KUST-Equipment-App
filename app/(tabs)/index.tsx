import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { db } from '../../firebaseConfig';

// 인터페이스 및 커스텀 컴포넌트 임포트
import { EquipmentTable } from '../../components/EquipmentTable';
import { InputHeader } from '../../components/InputHeader';
import { styles } from '../../styles/InputScreenStyles';
import { GearStatus, MemberEquipment, useEquipment } from './_layout';

export default function InputScreen() {
  const { data, setData } = useEquipment();
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isSortMode, setIsSortMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. 새로운 인원 추가 (맨 뒤 순서인 order 값 부여)
  const addRow = async () => {
    const createEmptyGear = (): GearStatus => ({ value: '', checked: false });
    const newId = Date.now().toString();
    const newRow: MemberEquipment = {
      id: newId,
      이름: '',
      order: data.length, // 현재 리스트의 총 개수를 순서로 지정
      가방: createEmptyGear(), BCD: createEmptyGear(), 호흡기: createEmptyGear(),
      슈트: createEmptyGear(), 마스크: createEmptyGear(), 핀: createEmptyGear(),
      부츠: createEmptyGear(), 장갑: createEmptyGear(), 후드: createEmptyGear(), 조끼: createEmptyGear()
    };

    // 로컬 상태 즉시 반영
    setData((prev: MemberEquipment[]) => [...prev, newRow]);
    
    // 서버 저장 (백그라운드)
    try {
      await setDoc(doc(db, "members", newId), newRow);
    } catch (e) {
      console.error("추가 실패:", e);
    }
  };

  // 2. 상세 정보 수정 (이름 또는 장비 값)
  const updateDetail = async (id: string, field: string, text: string) => {
    // (1) 로컬 상태 업데이트 (화면 즉시 반영)
    setData((prev: MemberEquipment[]) => prev.map(item => {
      if (item.id === id) {
        if (field === '이름') return { ...item, 이름: text };
        const key = field as keyof Omit<MemberEquipment, 'id' | '이름' | 'order'>;
        return { ...item, [key]: { ...item[key], value: text } };
      }
      return item;
    }));

    // (2) 서버 업데이트 (백그라운드)
    const targetItem = data.find(d => d.id === id);
    if (!targetItem) return;

    try {
      let updatedObj;
      if (field === '이름') {
        updatedObj = { ...targetItem, 이름: text };
      } else {
        const key = field as keyof Omit<MemberEquipment, 'id' | '이름' | 'order'>;
        updatedObj = { ...targetItem, [key]: { ...targetItem[key], value: text } };
      }
      await setDoc(doc(db, "members", id), updatedObj);
    } catch (e) {
      console.error("업데이트 실패:", e);
    }
  };

  // 3. 정렬 드래그 종료 시 (낙관적 업데이트 적용)
  const handleDragEnd = async (newData: MemberEquipment[]) => {
    // (1) 화면 즉시 반영: 순서(order)를 인덱스 번호로 재부여
    const updatedOrderData = newData.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setData(updatedOrderData); // 즉시 정렬 완료

    // (2) 서버 일괄 저장 (백그라운드)
    try {
      const promises = updatedOrderData.map(member => 
        setDoc(doc(db, "members", member.id), member)
      );
      await Promise.all(promises);
    } catch (e) {
      console.error("정렬 저장 실패:", e);
      Alert.alert("오류", "정렬 상태를 서버에 저장하지 못했습니다.");
    }
  };

  // 4. 선택 삭제 로직
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    Alert.alert("삭제", `${selectedIds.length}명을 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      { 
        text: "삭제", 
        style: "destructive",
        onPress: async () => {
          // 로컬 상태 즉시 삭제
          setData((prev: MemberEquipment[]) => prev.filter(i => !selectedIds.includes(i.id)));
          
          // 서버 데이터 개별 삭제
          try {
            const deletePromises = selectedIds.map(id => deleteDoc(doc(db, "members", id)));
            await Promise.all(deletePromises);
            setSelectedIds([]);
            setIsDeleteMode(false);
          } catch (e) {
            console.error("삭제 실패:", e);
          }
        } 
      }
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* 헤더 컴포넌트 */}
        <InputHeader 
          isDeleteMode={isDeleteMode}
          isSortMode={isSortMode}
          selectedCount={selectedIds.length}
          onAddRow={addRow}
          onToggleDelete={(mode: boolean) => { setIsDeleteMode(mode); setSelectedIds([]); }}
          onToggleSort={setIsSortMode}
          onBulkDelete={handleBulkDelete}
        />

        {/* 테이블 컴포넌트 */}
        <EquipmentTable 
          data={data}
          setData={handleDragEnd} // 정렬 로직 전달
          isSortMode={isSortMode}
          isDeleteMode={isDeleteMode}
          selectedIds={selectedIds}
          onSelect={(id: string) => setSelectedIds((prev: string[]) => 
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
          )}
          onUpdate={updateDetail}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}