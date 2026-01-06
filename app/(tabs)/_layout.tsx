import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. 데이터 모델 인터페이스 정의
export interface GearStatus {
  value: string;
  checked: boolean;
}

export interface MemberEquipment {
  id: string;
  이름: string;
  가방: GearStatus; BCD: GearStatus; 호흡기: GearStatus; 슈트: GearStatus;
  마스크: GearStatus; 핀: GearStatus; 부츠: GearStatus; 장갑: GearStatus;
  후드: GearStatus; 조끼: GearStatus;
}

// 2. Context 타입 정의
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

const STORAGE_KEY = '@kust_equipment_data_2026';

export default function TabLayout() {
  const [data, setData] = useState<MemberEquipment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 3. 비동기 데이터 로드 (Life Cycle: Mount)
  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        setData(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load storage', e);
    } finally {
      setIsLoaded(true); // 로딩 시도가 끝나야 저장을 허용함 (데이터 덮어쓰기 방지)
    }
  };

  // 4. 비동기 데이터 저장 (Life Cycle: Update)
  const saveData = async (newData: MemberEquipment[]) => {
    try {
      const jsonValue = JSON.stringify(newData);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save storage', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData(data);
    }
  }, [data, isLoaded]);

  return (
    <EquipmentContext.Provider value={{ data, setData }}>
      <Tabs screenOptions={{ 
        tabBarActiveTintColor: '#007AFF',
        tabBarIcon: () => null, 
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: {
            fontSize: 15,
            fontWeight: 'bold',
            bottom: -10, // 아이콘이 없으므로 텍스트 위치를 살짝 위로 조정
          },
        }}>
        
        <Tabs.Screen name="index" options={{ title: '정보 입력', headerShown: false }} />
        <Tabs.Screen name="checklist" options={{ title: '체크리스트', headerShown: false }} />
      </Tabs>
    </EquipmentContext.Provider>
  );
}