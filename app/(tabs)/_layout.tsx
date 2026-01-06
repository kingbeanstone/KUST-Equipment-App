import { Tabs } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';

export interface GearStatus { value: string; checked: boolean; }
export interface MemberEquipment {
  id: string; 이름: string;
  order: number;
  가방: GearStatus; BCD: GearStatus; 호흡기: GearStatus; 슈트: GearStatus;
  마스크: GearStatus; 핀: GearStatus; 부츠: GearStatus; 장갑: GearStatus;
  후드: GearStatus; 조끼: GearStatus;
}

interface EquipmentContextType {
  data: MemberEquipment[];
  setData: Dispatch<SetStateAction<MemberEquipment[]>>;
}

const EquipmentContext = createContext<EquipmentContextType | null>(null);
export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) throw new Error("useEquipment must be used within a Provider");
  return context;
};

export default function TabLayout() {
  const [data, setData] = useState<MemberEquipment[]>([]);

  useEffect(() => {
    // order 필드 기준으로 오름차순 정렬해서 가져오기
    const unsubscribe = onSnapshot(collection(db, "members"), (snapshot) => {
      const membersList = snapshot.docs.map(doc => ({ ...doc.data() })) as MemberEquipment[];
      // 서버에서 가져온 데이터를 order 순으로 정렬
      const sortedList = membersList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setData(sortedList);
    });
    return () => unsubscribe();
  }, []);

  return (
    // setData는 이제 순수하게 로컬 상태만 변경하는 Dispatch 타입입니다.
    <EquipmentContext.Provider value={{ data, setData }}>
      <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF',
        tabBarIcon: () => null, 
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 15, fontWeight: 'bold', bottom: -10 },
        tabBarStyle: { height: 65 }, }}>
        <Tabs.Screen name="index" options={{ title: '정보 입력', headerShown: false }} />
        <Tabs.Screen name="checklist" options={{ title: '체크리스트', headerShown: false }} />
      </Tabs>
    </EquipmentContext.Provider>
  );
}

