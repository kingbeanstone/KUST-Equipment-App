import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/InputScreenStyles';

interface Props {
  isDeleteMode: boolean;
  isSortMode: boolean;
  selectedCount: number;
  onAddRow: () => void;
  onToggleDelete: (mode: boolean) => void;
  onToggleSort: (mode: boolean) => void;
  onBulkDelete: () => void;
}

export const InputHeader = ({ 
  isDeleteMode, isSortMode, selectedCount, 
  onAddRow, onToggleDelete, onToggleSort, onBulkDelete 
}: Props) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>✍️ KUST 장비 입력</Text>
      <View style={styles.headerButtons}>
        {!isDeleteMode && (
          <TouchableOpacity 
            style={[styles.addButton, { marginRight: 8, backgroundColor: isSortMode ? '#212529' : '#fff' }]} 
            onPress={() => onToggleSort(!isSortMode)}
          >
            <Text style={{ color: isSortMode ? '#fff' : '#007AFF', fontWeight: 'bold' }}>
              {isSortMode ? '완료' : '정렬'}
            </Text>
          </TouchableOpacity>
        )}
        {!isSortMode && (
          !isDeleteMode ? (
            <>
              <TouchableOpacity style={styles.addButton} onPress={onAddRow}>
                <Text style={styles.addButtonText}>+ 추가</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addButton, { marginLeft: 8, backgroundColor: '#ff4d4f' }]} 
                onPress={() => onToggleDelete(true)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>삭제</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.addButton} onPress={() => onToggleDelete(false)}>
                <Text style={{ color: '#666' }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addButton, { marginLeft: 8, backgroundColor: '#ff4d4f' }]} 
                onPress={onBulkDelete}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>삭제 완료({selectedCount})</Text>
              </TouchableOpacity>
            </>
          )
        )}
      </View>
    </View>
  );
};