import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useModalStore } from '../../store/modalStore';
import { Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export function GlobalModal() {
    const { isOpen, options, closeModal } = useModalStore();

    if (!options) return null;

    const icons = {
        info: <Info className="w-12 h-12 text-blue-500" />,
        success: <CheckCircle className="w-12 h-12 text-emerald-500" />,
        warning: <AlertTriangle className="w-12 h-12 text-amber-500" />,
        danger: <AlertCircle className="w-12 h-12 text-red-500" />,
    };

    const handleConfirm = () => {
        if (options.onConfirm) options.onConfirm();
        closeModal();
    };

    const handleCancel = () => {
        if (options.onCancel) options.onCancel();
        closeModal();
    };

    return (
        <Modal isOpen={isOpen} onClose={closeModal} title={options.title}>
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-inner">
                    {icons[options.type || 'info']}
                </div>

                <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                        {options.message}
                    </p>
                </div>

                <div className="flex w-full space-x-3 pt-4">
                    {options.cancelLabel && (
                        <Button variant="secondary" className="flex-1" onClick={handleCancel}>
                            {options.cancelLabel}
                        </Button>
                    )}
                    <Button
                        variant={options.type === 'danger' ? 'danger' : 'strong'}
                        className="flex-1"
                        onClick={handleConfirm}
                    >
                        {options.confirmLabel || 'Entendido'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
