import React from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  variant = 'default',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle size={24} className="text-red-600" />,
      confirmBtn: 'bg-red-600 text-white hover:bg-red-700',
    },
    warning: {
      icon: <AlertTriangle size={24} className="text-amber-600" />,
      confirmBtn: 'bg-amber-600 text-white hover:bg-amber-700',
    },
    default: {
      icon: <CheckCircle size={24} className="text-blue-600" />,
      confirmBtn: 'bg-black text-white hover:bg-gray-800',
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full mx-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <div className="flex items-center gap-3">
            {styles.icon}
            <h3 className="font-bold font-mono text-lg">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="font-mono text-sm text-gray-600">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t-2 border-black bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 font-bold font-mono text-sm border-2 border-black bg-white hover:bg-gray-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 font-bold font-mono text-sm border-2 border-black transition-colors ${styles.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
