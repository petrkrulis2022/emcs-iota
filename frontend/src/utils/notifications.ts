import toast from 'react-hot-toast';

export const showSuccessNotification = (message: string, transactionId?: string) => {
  const fullMessage = transactionId
    ? `${message}\nTransaction ID: ${transactionId.slice(0, 10)}...${transactionId.slice(-8)}`
    : message;

  toast.success(fullMessage, {
    duration: 5000,
  });
};

export const showErrorNotification = (message: string) => {
  toast.error(message, {
    duration: 5000,
  });
};

export const showLoadingNotification = (message: string) => {
  return toast.loading(message);
};

export const dismissNotification = (toastId: string) => {
  toast.dismiss(toastId);
};
