import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// --- 인터페이스 정의 ---
export interface GearStatus {
  value: string;   // 장비 규격/정보
  checked: boolean; // 체크 여부
}

export interface MemberEquipment {
  id: string;
  이름: string;
  가방: GearStatus; BCD: GearStatus; 호흡기: GearStatus; 슈트: GearStatus;
  마스크: GearStatus; 핀: GearStatus; 부츠: GearStatus; 장갑: GearStatus;
  후드: GearStatus; 조끼: GearStatus;
}

interface EquipmentContextType {
  data: MemberEquipment[];
  setData: React.Dispatch<React.SetStateAction<MemberEquipment[]>>;
}

const EquipmentContext = createContext<EquipmentContextType | null>(null);
export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) throw new Error("useEquipment must be used within a Provider");
  return context;
};

const STORAGE_KEY = '@kust_equipment_v1';

export default function TabLayout() {
  const [data, setData] = useState<MemberEquipment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 데이터 로드 (Lifecycle: Mount)
  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue !== null) {
          setData(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error('Load Error:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // 데이터 저장 (Lifecycle: Update)
  useEffect(() => {
    if (isLoaded) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.error('Save Error:', e);
        }
      };
      saveData();
    }
  }, [data, isLoaded]);

  return (
    <EquipmentContext.Provider value={{ data, setData }}>
      <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
        <Tabs.Screen name="index" options={{ title: '정보 입력', headerShown: false }} />
        <Tabs.Screen name="checklist" options={{ title: '체크리스트', headerShown: false }} />
      </Tabs>
    </EquipmentContext.Provider>
  );
}