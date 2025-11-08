import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ToastItem = styled.div<{ $type: 'success' | 'error' | 'info'; $isExiting: boolean }>`
  min-width: 300px;
  padding: 16px 20px;
  border-radius: 8px;
  background: ${(props) => {
    switch (props.$type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'info':
        return '#2196f3';
      default:
        return '#333';
    }
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${(props) => (props.$isExiting ? slideOut : slideIn)} 0.3s ease-out;
  font-size: 15px;
`;

const ToastIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`;

const ToastMessage = styled.div`
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const getIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'info':
      return 'ℹ';
    default:
      return '';
  }
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onRemove,
}) => {
  const [exitingToasts, setExitingToasts] = React.useState<Set<string>>(new Set());

  useEffect(() => {
    toasts.forEach((toast) => {
      const duration = toast.duration || 3000;
      const timer = setTimeout(() => {
        handleRemove(toast.id);
      }, duration);

      return () => clearTimeout(timer);
    });
  }, [toasts]);

  const handleRemove = (id: string) => {
    setExitingToasts((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onRemove(id);
      setExitingToasts((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          $type={toast.type}
          $isExiting={exitingToasts.has(toast.id)}
        >
          <ToastIcon>{getIcon(toast.type)}</ToastIcon>
          <ToastMessage>{toast.message}</ToastMessage>
          <CloseButton onClick={() => handleRemove(toast.id)}>×</CloseButton>
        </ToastItem>
      ))}
    </ToastContainer>
  );
};

// Hook for using toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info', duration?: number) => {
    const id = `${Date.now()}_${Math.random()}`;
    const toast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) => addToast(message, 'success', duration);
  const error = (message: string, duration?: number) => addToast(message, 'error', duration);
  const info = (message: string, duration?: number) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    ToastComponent: () => <ToastNotification toasts={toasts} onRemove={removeToast} />,
  };
};
