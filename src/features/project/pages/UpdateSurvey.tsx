import dayjs from "dayjs";
import { AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BiLeftArrowCircle } from "react-icons/bi";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../../app/lib/api";
import { useToast } from "../../../app/providers/ToastProvider";
import { useTabs } from "../../console/context/TabContext";
import type { SurveyDetails } from "../@types";
import NewSurveySchedule from "../components/NewSurveySchedule";
import {
  changeSurveySchedule,
  getSurveyById,
} from "../services/projectService";

const UpdateSurvey = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const { addTab } = useTabs();
  const [changing, setChanging] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const [surveyDetails, setSurveyDetails] = useState<SurveyDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const fetchProjectDetails = async () => {
    if (!surveyId) {
      setError("Invalid survey ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getSurveyById(parseInt(surveyId, 10));

      if (!res) {
        setError("Survey not found.");
      } else {
        setSurveyDetails(res);
        // Add tab to header when survey details are successfully fetched

        addTab({
          name: "Update survey",
          path: `/console/update-survey/${surveyId}`,
          headerName: "Update survey",
        });
      }
    } catch (err) {
      console.error("Error fetching survey details:", err);
      let message = "Failed to load survey details. Please try again.";
      if (err instanceof ApiError) {
        if (err.response) {
          if (typeof err.response === "string") {
            message = err.response;
          } else if (typeof err.response === "object") {
            const response = err.response as any;
            message = response.error || response.message || message;
          }
        } else if (err.message) {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = async (schedule: number) => {
    if (!surveyId) {
      setScheduleError("Invalid survey ID.");
      return;
    }

    setChanging(true);

    try {
      setScheduleError(null);
      const NextRunAt = await changeSurveySchedule(
        parseInt(surveyId, 10),
        schedule
      );
      setSurveyDetails((oldSurvey) => {
        if (!oldSurvey) return null;
        return {
          ...oldSurvey,
          NextRunAt: NextRunAt as string | null,
        };
      });

      toast.success({
        title: "Success",
        message: "Survey schedule changed successfully",
      });
      setChanging(false);
    } catch (err) {
      console.error("Error changing survey schedule:", err);
      let message = "Failed to change survey schedule. Please try again.";
      if (err instanceof ApiError) {
        if (err.response) {
          if (typeof err.response === "string") {
            message = err.response;
          } else if (typeof err.response === "object") {
            const response = err.response as any;
            message = response.error || response.message || message;
          }
        } else if (err.message) {
          message = err.message;
        }
      }
      toast.error({
        title: "Error",
        message: message,
      });
      setChanging(false);
      setScheduleError(message);
    }
  };

  // Wrapper function to convert between NewSurvey and SurveyDetails
  const handleNewSurveyUpdate = (
    update:
      | {
          SchedulePeriodHours?: number | null;
          ScheduleName?: string;
          MontlyCost?: number;
        }
      | ((prev: {
          SchedulePeriodHours?: number | null;
          ScheduleName?: string;
          MontlyCost?: number;
        }) => {
          SchedulePeriodHours?: number | null;
          ScheduleName?: string;
          MontlyCost?: number;
        })
  ) => {
    setSurveyDetails((oldSurvey) => {
      if (!oldSurvey) return null;

      const newScheduleData =
        typeof update === "function"
          ? update({
              SchedulePeriodHours: oldSurvey.SchedulePeriodHours,
              ScheduleName: undefined,
              MontlyCost: undefined,
            })
          : update;

      return {
        ...oldSurvey,
        SchedulePeriodHours:
          newScheduleData.SchedulePeriodHours ?? oldSurvey.SchedulePeriodHours,
      };
    });
  };

  // Convert SurveyDetails to NewSurvey format
  const newSurveyData = surveyDetails
    ? {
        SchedulePeriodHours: surveyDetails.SchedulePeriodHours,
        ScheduleName: undefined,
        MontlyCost: undefined,
      }
    : {};

  useEffect(() => {
    fetchProjectDetails();
  }, [surveyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading survey details...
        </p>
      </div>
    );
  }

  if (error && !surveyDetails) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 rounded-[20px] border border-gray-200 dark:border-gray-700 p-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              fetchProjectDetails();
            }}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div className="flex items-center text-[13px] mb-2">
        <BiLeftArrowCircle
          onClick={() => navigate(-1)}
          className="h-4 w-4 mr-2 text-2xl cursor-pointer"
        />
        Go back
      </div>
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Error Message for Schedule Change */}
        {scheduleError && (
          <div className="p-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {scheduleError}
                </p>
              </div>
              <button
                onClick={() => setScheduleError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Survey Schedule Component */}
        <div className="">
          <NewSurveySchedule
            newSurvey={newSurveyData}
            setNewSurvey={handleNewSurveyUpdate}
            onChange={handleScheduleChange}
          />
        </div>

        {/* Next Run Date Display */}
        {!changing && surveyDetails?.NextRunAt && (
          <div className="bg-gray-100 dark:bg-gray-900 rounded-[20px] border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Survey is scheduled to run next at
              </p>

              <div className="h-px w-full max-w-xs bg-gray-200 dark:bg-gray-700" />

              <div className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
                <div>
                  {dayjs(surveyDetails.NextRunAt).format("DD MMMM YYYY")}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {dayjs(surveyDetails.NextRunAt).format("dddd")}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {dayjs(surveyDetails.NextRunAt).format("HH:mm")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateSurvey;
