import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPayment } from "../api/authApi";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">(
    "verifying"
  );
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Khalti sends ?pidx=xxx in the return URL
    const pidx = searchParams.get("pidx");

    if (!pidx) {
      setStatus("failed");
      setError("No payment reference received");
      return;
    }

    const verify = async () => {
      try {
        const res = await verifyPayment(pidx);
        setTransactionId(res.data.transactionId || "");
        setStatus("success");
      } catch (err: any) {
        setStatus("failed");
        setError(
          err.response?.data?.message || "Payment verification failed"
        );
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#2E4E3F] rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-500 text-sm">
              Please wait while we confirm your payment with Khalti.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Your booking has been paid successfully via Khalti.
            </p>
            {transactionId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Transaction ID
                </p>
                <p className="font-mono font-semibold text-gray-700 text-sm break-all">
                  {transactionId}
                </p>
              </div>
            )}
            <button
              onClick={() => navigate("/client")}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
              style={{ backgroundColor: "#2E4E3F" }}
            >
              Back to Dashboard
            </button>
          </>
        )}

        {status === "failed" && (
          <>
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
              Payment Failed
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {error || "Something went wrong with your payment."}
            </p>
            <button
              onClick={() => navigate("/client")}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-red-500 hover:bg-red-600 transition"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
