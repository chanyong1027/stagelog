import { create } from 'zustand';

interface UiState {
  // 모달 상태
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;

  // 사이드바 상태
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  // 전역 로딩 상태
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

/**
 * UI 상태 관리 Zustand 스토어
 * - 모달, 사이드바, 전역 로딩 등 UI 상태 관리
 */
export const useUiStore = create<UiState>((set) => ({
  // 모달 상태
  isModalOpen: false,
  modalContent: null,
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),

  // 사이드바 상태
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  // 전역 로딩 상태
  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
}));
