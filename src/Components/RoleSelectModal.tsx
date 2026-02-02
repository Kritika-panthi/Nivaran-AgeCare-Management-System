import { X, Heart, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const RoleSelectModal = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-3xl p-10 relative shadow-xl">

        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        <h2 className="text-3xl font-semibold text-center mb-2">
          Join Nivaran
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Choose your account type to proceed
        </p>

        <div className="space-y-4">

          <button
            onClick={() => {
              navigate("/register/client");
              onClose();
            }}
            className="w-full border rounded-2xl p-6 flex items-center gap-4 hover:bg-gray-50 transition"
          >
            <Heart className="text-[#3e5439]" />
            <div className="text-left">
              <p className="font-semibold text-lg">Family Member</p>
              <p className="text-sm text-gray-500">
                I need care for my loved ones
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              navigate("/register/caregiver");
              onClose();
            }}
            className="w-full border rounded-2xl p-6 flex items-center gap-4 hover:bg-gray-50 transition"
          >
            <User className="text-[#3e5439]" />
            <div className="text-left">
              <p className="font-semibold text-lg">Caregiver</p>
              <p className="text-sm text-gray-500">
                I want to provide care services
              </p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default RoleSelectModal;
