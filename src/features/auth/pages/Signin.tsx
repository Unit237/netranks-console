import { Keyboard } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../app/providers/ToastProvider";
import token from "../../../app/utils/token";
import Hand from "../../../assets/col.svg";
import Logo from "../../../assets/user.svg";
import SurveyStack from "../components/SurveyStack";
import { sendMagicLink } from "../services/authService";

const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const toast = useToast();

  const visitorSessionToken = token.getVisitor();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await sendMagicLink(email, visitorSessionToken as string);
      toast.success({
        title: "Success",
        message: "Magic link sent successfully",
      });
      navigate("/magic-link-sent");
    } catch (error) {
      toast.error({
        title: "Error",
        message: "Failed to send magic link",
      });
      console.error("Failed to send magic link:", error);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Section - Sign In */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md lg:max-w-[23vw]">
          <div className="flex flex-col items-start text-start">
            {/* Avatar */}
            <div className="mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-600 p-2">
                <img src={Logo} alt="User" className="h-full w-full" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-normal mb-1">
              Sign up or log In to NetRanks
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enter your email to get started
            </p>

            <form className="w-full" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="relative w-full mb-6">
                <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 w-5 h-5" />
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full bg-transparent border border-gray-300 dark:border-gray-600 pl-10 pr-3 py-2.5 sm:py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Magic Link Button */}
              <button
                disabled={!email || email === "" || submitting}
                onClick={handleSubmit}
                className="w-full bg-black dark:bg-white dark:text-black text-white font-medium rounded-full py-2.5 sm:py-3 hover:bg-gray-700 dark:hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending Magic Link..." : "Send Magic Link"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section - Saved Surveys */}
      <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 flex flex-col p-4 sm:p-6">
        {/* Header */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Unlock your full report & dashboard
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Your saved surveys are waiting for you:
        </h2>

        <SurveyStack />

        {/* Testimonial */}
        <div className="mt-6 px-4 pb-4 pt-2 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <img src={Hand} alt="Hand" className="h-[50px] w-[50px]" />
          <p className="text-sm text-gray-800 dark:text-gray-300 mb-4 leading-relaxed">
            NetRanks gave us the insights we needed to understand our position
            in a crowded market. Invaluable.
          </p>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-500 mr-3"></div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Jane Doe
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CEO, SomeCoolStartup
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
