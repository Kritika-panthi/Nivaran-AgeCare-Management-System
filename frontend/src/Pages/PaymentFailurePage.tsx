import { useNavigate } from "react-router-dom";

const PaymentFailurePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Payment Cancelled
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Your payment was not completed. You can try again from your dashboard.
        </p>
        <button
          onClick={() => navigate("/client")}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-red-500 hover:bg-red-600 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
