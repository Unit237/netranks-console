import { Check, Globe, PlayCircle } from "lucide-react";
import { useState } from "react";

interface FormData {
  name: string;
  brandName: string;
  brandWebsite: string;
}

const CompleteProfile = () => {
  const [form, setForm] = useState<FormData>({
    name: "",
    brandName: "",
    brandWebsite: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const wtd: string[] = [
    "Create unlimited projects",
    "Set up automated weekly reports",
    "Invite your entire team",
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white dark:bg-gray-900">
      {/* Left Section - Sign In */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-start">
            {/* Title */}
            <h1 className="mb-1 text-base font-medium text-gray-900 dark:text-white">
              Welcome to NetRanks!
            </h1>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Let's set up your first project
            </p>

            {/* Form Fields */}
            <div className="w-full space-y-4">
              {/* Name Field */}
              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                  Your name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="your name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Brand Name Field */}
              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                  Brand's name
                </label>
                <input
                  type="text"
                  name="brandName"
                  placeholder="brand name"
                  value={form.brandName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Website Field */}
              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                  Website's name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="brandWebsite"
                    placeholder="your brandWebsite"
                    value={form.brandWebsite}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-300 bg-white py-2.5 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Magic Link Button */}
              <button className="w-full rounded-2xl bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                Send magic link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Preview */}
      <div className="flex w-full flex-col bg-gray-100 p-6 lg:w-[400px] lg:p-8 dark:bg-gray-800">
        {/* Header */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          A Glimpse Inside Your Workspace
        </p>
        <h2 className="mb-6 text-sm font-light text-gray-900 dark:text-white">
          See what to expect
        </h2>

        {/* Video Card */}
        <div className="mb-8 flex h-56 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-gray-700">
          <button className="cursor-pointer transition-transform hover:scale-110">
            <PlayCircle className="h-12 w-12 text-gray-400" />
          </button>
        </div>

        {/* What You Can Do Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <h3 className="px-3 py-3 text-xs font-light text-gray-900 dark:text-white">
            What you can do next
          </h3>

          <div className="border border-gray-200 p-4 dark:border-gray-700">
            <div className="space-y-3">
              {wtd.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {/* Check Badge */}
                  <div className="flex h-6 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>

                  {/* Text */}
                  <p className="text-sm leading-5 text-gray-900 dark:text-white">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
