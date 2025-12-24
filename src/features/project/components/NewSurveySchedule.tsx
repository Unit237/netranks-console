import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../../../app/providers/ToastProvider";
import { money } from "../hooks/utils";
import { Confirm } from "./Confirm";

type ScheduleRow = {
  period: number;
  name: string;
  cost: number;
  default?: boolean;
};

const rows: ScheduleRow[] = [
  { period: 24 * 0, name: "One Time", cost: 0 },
  { period: 24 * 7, name: "Weekly", cost: 200, default: true },
  { period: 24 * 1, name: "Daily", cost: 1200 },
];

type NewSurvey = {
  SchedulePeriodHours?: number | null;
  ScheduleName?: string;
  MontlyCost?: number;
};

interface Props {
  newSurvey: NewSurvey;
  setNewSurvey: React.Dispatch<React.SetStateAction<NewSurvey>>;
  onContinue?: () => void;
  onChange?: (period: number) => Promise<void>;
}

export default function NewSurveySchedule({
  newSurvey,
  setNewSurvey,
  onContinue,
  onChange,
}: Props) {
  const confirm = useRef<any>(null);
  const toast = useToast();
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (newSurvey.SchedulePeriodHours == null) {
      const def = rows.find((x) => x.default);
      if (def) select(def);
    }
  }, [newSurvey.SchedulePeriodHours]);

  const select = (x: ScheduleRow) => {
    setNewSurvey((old) => ({
      ...old,
      SchedulePeriodHours: x.period,
      ScheduleName: x.name,
      MontlyCost: x.cost,
    }));
  };

  const handleSelect = async (x: ScheduleRow) => {
    if (!onChange) {
      select(x);
      return;
    }

    confirm.current.show(
      "Change Survey Schedule",
      "Are you sure you want to change the survey schedule?",
      async () => {
        setChanging(true);
        try {
          await onChange(x.period);
          select(x);
          toast.success({
            title: "Success",
            message: "Survey schedule changed successfully",
          });
        } catch (error: any) {
          toast.error({
            title: "Error",
            message: error.message,
          });
        } finally {
          setChanging(false);
        }
      }
    );
  };

  if (changing) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700" />
        <p className="text-lg font-medium text-gray-700">
          Changing the survey schedule
        </p>

        <Confirm ref={confirm} />
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[600px] overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3"></th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Schedule
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                Monthly Cost
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((x) => {
              const checked = newSurvey.SchedulePeriodHours === x.period;

              return (
                <tr
                  key={x.period}
                  onClick={() => handleSelect(x)}
                  className="cursor-pointer border-t transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="radio"
                      checked={checked}
                      readOnly
                      className="h-4 w-4 accent-gray-800"
                    />
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-800">
                    {x.name}
                  </td>

                  <td className="px-4 py-3 text-right text-gray-700">
                    {money(x.cost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {onContinue && (
        <div className="mt-6">
          <button onClick={onContinue}>Continue</button>
        </div>
      )}

      <Confirm ref={confirm} />
    </>
  );
}
