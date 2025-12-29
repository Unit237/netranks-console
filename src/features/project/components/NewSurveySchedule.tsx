import React, { useEffect, useRef, useState } from "react";
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
  onChange?: (period: number) => Promise<void>;
}

export default function NewSurveySchedule({
  newSurvey,
  setNewSurvey,
  onChange,
}: Props) {
  const confirm = useRef<any>(null);

  const [changing, setChanging] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleRow | null>(
    null
  );

  useEffect(() => {
    if (newSurvey.SchedulePeriodHours == null) {
      const def = rows.find((x) => x.default);
      if (def) {
        setSelectedSchedule(def);
        select(def);
      }
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

  const handleSelect = async () => {
    if (!selectedSchedule) return;

    const x = selectedSchedule;

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
        } catch (error: any) {
        } finally {
          setChanging(false);
        }
      }
    );
  };

  return (
    <div className="min-w-[40vw] flex flex-col items-center justify-center space-y-4">
      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
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
            {rows.map((x) => (
              <tr
                key={x.period}
                onClick={() => setSelectedSchedule(x)}
                className="cursor-pointer border-t transition hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-center">
                  <input
                    type="radio"
                    checked={selectedSchedule?.period === x.period}
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
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full flex justify-end items-end gap-2">
        <button
          onClick={() => handleSelect()}
          disabled={!selectedSchedule || changing}
          className="bg-green-500 hover:bg-green-600 transition-all text-white rounded-md px-3 py-1 w-[6rem] items-center flex justify-center"
        >
          {changing ? (
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-gray-600" />
          ) : (
            "Finish"
          )}
        </button>
      </div>

      <Confirm ref={confirm} />
    </div>
  );
}
