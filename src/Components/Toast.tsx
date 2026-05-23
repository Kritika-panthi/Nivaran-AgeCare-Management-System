import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X,
         Info } from "lucide-react";

export type ToastType =
  "success" | "error" | "warning" | "info";

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
};

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const STYLES = {
  success: {
    wrapper: "bg-white border-l-4 border-green-500",
    icon: "text-green-500",
    title: "text-green-700",
    message: "text-gray-600",
    bar: "bg-green-500",
    label: "Success",
  },
  error: {
    wrapper: "bg-white border-l-4 border-red-500",
    icon: "text-red-500",
    title: "text-red-700",
    message: "text-gray-600",
    bar: "bg-red-500",
    label: "Error",
  },
  warning: {
    wrapper: "bg-white border-l-4 border-yellow-500",
    icon: "text-yellow-500",
    title: "text-yellow-700",
    message: "text-gray-600",
    bar: "bg-yellow-500",
    label: "Warning",
  },
  info: {
    wrapper: "bg-white border-l-4 border-blue-500",
    icon: "text-blue-500",
    title: "text-blue-700",
    message: "text-gray-600",
    bar: "bg-blue-500",
    label: "Info",
  },
};

const Toast = ({
  message,
  type = "error",
  onClose,
  duration = 6000,
}: ToastProps) => {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  // Slide in on mount
  useEffect(() => {
    const showTimer = setTimeout(
      () => setVisible(true), 10
    );
    return () => clearTimeout(showTimer);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - (100 / (duration / 100));
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [duration]);

  // Auto close after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const s = STYLES[type];
  const IconComp = ICONS[type];

  return (
    <div
      className={`w-full rounded-xl shadow-lg
                  overflow-hidden transition-all
                  duration-300 ${s.wrapper} ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 px-4 py-4">
        <div className={`mt-0.5 flex-shrink-0 ${s.icon}`}>
          <IconComp className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold uppercase
                         tracking-wider mb-0.5 ${s.title}`}>
            {s.label}
          </p>
          <p className={`text-sm leading-relaxed
                         ${s.message}`}>
            {message}
          </p>
        </div>

        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-gray-300
                     hover:text-gray-500 transition
                     mt-0.5 ml-1"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className={`h-full transition-all ease-linear
                      ${s.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Toast;

// ── useToast hook ─────────────────────────────────────

export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = (
    message: string,
    type: ToastType = "error"
  ) => {
    // Reset first so same message can show again
    setToast(null);
    setTimeout(() => setToast({ message, type }), 10);
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
};
