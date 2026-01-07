import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. Props 인터페이스에 isEditMode와 onToggleEdit를 추가합니다.
interface Props {
  isDeleteMode: boolean;
  isSortMode: boolean;
  isEditMode: boolean; // 💡 추가
  sortModeText?: string;
  selectedCount: number;
  onAddRow: () => void;
  onToggleDelete: (m: boolean) => void;
  onToggleSort: (m: boolean) => void;
  onToggleEdit: (m: boolean) => void; // 💡 추가 (타입 지정으로 'any' 에러 해결)
  onBulkDelete: () => void;
}

export const InputHeader = ({
  isDeleteMode,
  isSortMode,
  isEditMode, // 💡 Props 추가
  sortModeText,
  selectedCount,
  onAddRow,
  onToggleDelete,
  onToggleSort,
  onToggleEdit, // 💡 Props 추가
  onBulkDelete,
}: Props) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>📋 장비 정보 입력</Text>
      
      <View style={styles.buttonGroup}>
        {/* 추가 버튼 (모든 모드가 꺼져있을 때만 노출) */}
        {!isDeleteMode && !isSortMode && !isEditMode && (
          <TouchableOpacity style={styles.actionButton} onPress={onAddRow}>
            <Text style={styles.buttonText}>+ 추가</Text>
          </TouchableOpacity>
        )}

        {/* 💡 정보 수정 버튼 (삭제/정렬 모드가 아닐 때 노출) */}
        {!isDeleteMode && !isSortMode && (
          <TouchableOpacity 
            style={[styles.actionButton, isEditMode && styles.activeButton]} 
            onPress={() => onToggleEdit(!isEditMode)}
          >
            <Text style={styles.buttonText}>{isEditMode ? "완료" : "수정"}</Text>
          </TouchableOpacity>
        )}

        {/* 정렬 모드 토글 버튼 (삭제/수정 모드가 아닐 때 노출) */}
        {!isDeleteMode && !isEditMode && (
          <TouchableOpacity 
            style={[styles.actionButton, isSortMode && styles.activeButton]} 
            onPress={() => onToggleSort(!isSortMode)}
          >
            <Text style={styles.buttonText}>{sortModeText || (isSortMode ? "완료" : "정렬")}</Text>
          </TouchableOpacity>
        )}

        {/* 삭제 모드 버튼 (정렬/수정 모드가 아닐 때 노출) */}
        {!isSortMode && !isEditMode && (
          <TouchableOpacity 
            style={[styles.actionButton, isDeleteMode && styles.deleteActiveButton]} 
            onPress={() => onToggleDelete(!isDeleteMode)}
          >
            <Text style={styles.buttonText}>{isDeleteMode ? "취소" : "삭제"}</Text>
          </TouchableOpacity>
        )}

        {/* 실제 삭제 실행 버튼 */}
        {isDeleteMode && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.bulkDeleteButton]} 
            onPress={onBulkDelete}
            disabled={selectedCount === 0}
          >
            <Text style={styles.buttonText}>{selectedCount}명 삭제</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#17a2b8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 8 },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  activeButton: { backgroundColor: '#ffc107', borderColor: '#ffc107' }, 
  deleteActiveButton: { backgroundColor: '#dc3545', borderColor: '#dc3545' },
  bulkDeleteButton: { backgroundColor: '#dc3545', borderColor: '#dc3545' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});