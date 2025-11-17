import { Keyboard } from "lucide-react";
import React, { useState } from "react";
import { FaLinkedinIn } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../../app/providers/ToastProvider";
import ToggleTheme from "../../../app/shared/components/ToggleTheme";
import Hand from "../../../assets/col.svg";
import Logo from "../../../assets/user.svg";
import SurveyStack from "../components/SurveyStack";
import { sendMagicLink } from "../services/authService";

const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const toast = useToast();

  const visitorSessionToken = useSearchParams()[0].get("vt");
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    <div className="flex min-h-screen">
      {/* Left Section - Sign In */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[23vw] px-4">
          <div className="flex flex-col items-start text-start">
            {/* Avatar */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-600 mb-4 p-2">
              <img src={Logo} alt="User" className="h-full w-full" />
            </div>

            <ToggleTheme />

            {/* Title */}
            <h1 className="text-xl font-normal mb-1">
              Sign up or log In to NetRanks
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Use SSO or enter your email to get started
            </p>

            {/* Google Button */}
            <button className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-900 font-medium rounded-full py-2 mb-3 transition hover:bg-gray-50 dark:hover:bg-black dark:border-gray-700 dark:text-gray-100">
              <FcGoogle size={20} />
              Continue with Google
            </button>

            {/* LinkedIn Button */}
            <button className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-900 font-medium rounded-full py-2 mb-5 transition hover:bg-gray-50 dark:hover:bg-black dark:border-gray-700 dark:text-gray-100">
              <FaLinkedinIn className="text-[#0A66C2]" size={18} />
              Continue with LinkedIn
            </button>

            {/* Divider */}
            <div className="flex w-full items-center justify-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">OR</p>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            </div>

            <form onSubmit={handleSubmit} className="w-full">
              {/* Email Input */}
              <div className="relative w-full mb-6">
                <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300" />
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full bg-transparent border border-gray-300 dark:border-gray-600 pl-10 pr-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Magic Link Button */}
              <button
                disabled={!email || email === ""}
                type="submit"
                className="w-full bg-black dark:bg-white dark:text-black text-white font-medium rounded-full py-2 hover:bg-gray-700 dark:hover:bg-gray-300 transition"
              >
                Send magic link
              </button>
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-end text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Don't have an account?{" "}
                  <a
                    href="/signup"
                    className="text-primary hover:underline dark:text-primary ml-1"
                  >
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section - Saved Surveys */}
      <div className="w-[400px] border-l bg-gray-100 dark:bg-[#101010] border-gray-200 dark:border-gray-700 flex flex-col p-6">
        {/* Header */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Unlock your full report & dashboard
        </p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Your saved surveys are waiting for you:
        </h2>

        <SurveyStack />

        {/* Testimonial */}
        <div className="px-4 pb-2 rounded-[40px] border border-gray-200 dark:border-gray-700">
          <img src={Hand} alt="Hand" className="h-[50px] w-[50px]" />
          <p className="text-sm text-gray-800 dark:text-gray-300 mb-4 leading-relaxed">
            NetRanks gave us the insights we needed to understand our position
            in a crowded market. Invaluable.
          </p>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#FF6B35] mr-3"></div>
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
