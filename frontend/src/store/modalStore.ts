import { create } from 'zustand';

interface ModalOptions {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'danger';
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ModalStore {
    isOpen: boolean;
    options: ModalOptions | null;
    showAlert: (options: ModalOptions) => void;
    showConfirm: (options: ModalOptions) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
    isOpen: false,
    options: null,
    showAlert: (options) => set({ isOpen: true, options: { ...options, cancelLabel: undefined } }),
    showConfirm: (options) => set({ isOpen: true, options }),
    closeModal: () => set({ isOpen: false, options: null }),
}));
