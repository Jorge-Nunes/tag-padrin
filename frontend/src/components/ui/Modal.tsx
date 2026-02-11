import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Card, CardBody, CardHeader } from './Card';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    
    // Implementa focus trap para acessibilidade (WCAG 2.1 SC 2.4.3)
    useFocusTrap(modalRef, isOpen);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Fechar modal com tecla Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <Card 
                ref={modalRef}
                className={`relative w-full ${maxWidth} shadow-2xl animate-in zoom-in-95 duration-200 border-gray-100 dark:border-slate-800`}
            >
                {title && (
                    <CardHeader className="flex flex-row items-center justify-between py-5">
                        <h2 
                            id="modal-title"
                            className="text-xl font-bold text-gray-900 dark:text-white leading-none text-left"
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="min-w-[44px] min-h-[44px] p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                            aria-label="Fechar modal"
                        >
                            <X size={20} />
                        </button>
                    </CardHeader>
                )}
                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 min-w-[44px] min-h-[44px] p-2 z-10 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                        aria-label="Fechar modal"
                    >
                        <X size={20} />
                    </button>
                )}
                <CardBody className={title ? 'pt-2 pb-8' : 'py-10'}>
                    {children}
                </CardBody>
            </Card>
        </div>,
        document.body
    );
}
