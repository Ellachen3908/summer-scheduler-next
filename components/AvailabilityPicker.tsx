"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildWeeks, slotTimes, slotToUtc } from "@/lib/time";
import type { AvailabilitySlot, OwnerType } from "@/lib/types";

export function AvailabilityPicker({
  ownerType,
  ownerId,
  initialSlots
}: {
  ownerType: OwnerType;
  ownerId: string;
  initialSlots: AvailabilitySlot[];
}) {
  const weeks = useMemo(() => buildWeeks(), []);
  const [weekIndex, setWeekIndex] = useState(0);
  const [selected, setSelected] = useState(
    () => new Set(initialSlots.map((slot) => slot.slot_start))
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const isTutor = ownerType === "teacher";
  const activeWeek = weeks[weekIndex];

  const text = isTutor
    ? {
        allWeek: "Available All Week（整周可用）",
        weekdays: "Weekdays Available（周一到周五可用）",
        weekend: "Weekend Available（周末可用）",
        clear: "Clear This Week（清空本周）",
        save: "Save Availability（保存时间）",
        saving: "Saving（保存中）",
        saved: "Availability Saved（时间已保存）",
        time: "Time（时间）",
        available: "Available（可用）"
      }
    : {
        allWeek: "整周可用",
        weekdays: "周一到周五可用",
        weekend: "周末可用",
        clear: "清空本周",
        save: "保存时间",
        saving: "保存中",
        saved: "时间已保存",
        time: "时间",
        available: "可用"
      };

  function weekLabel(week: (typeof weeks)[number]) {
    if (!isTutor) return week.label;
    return `Week ${week.index + 1}（${week.label}）`;
  }

  function dayLabel(day: (typeof activeWeek.days)[number], dayIndex: number) {
    if (!isTutor) return day.label;

    const englishDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const datePart = day.label.replace(/^周[一二三四五六日]\s*/, "");

    return `${englishDays[dayIndex]} ${datePart}（${day.label}）`;
  }

  function slotKey(day: (typeof activeWeek.days)[number], time: string) {
    return slotToUtc(day.date, time);
  }

  function toggleSlot(day: (typeof activeWeek.days)[number], time: string) {
    const key = slotKey(day, time);

    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    setMessage("");
  }

  function setWeekSlots(dayIndexes: number[], enabled: boolean) {
    setSelected((current) => {
      const next = new Set(current);

      for (const dayIndex of dayIndexes) {
        const day = activeWeek.days[dayIndex];

        for (const time of slotTimes) {
          const key = slotKey(day, time);
          if (enabled) {
            next.add(key);
          } else {
            next.delete(key);
          }
        }
      }

      return next;
    });

    setMessage("");
  }

  async function saveSlots() {
    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const slots = Array.from(selected).map((start) => {
      const end = new Date(new Date(start).getTime() + 30 * 60 * 1000).toISOString();

      return {
        slot_start: start,
        slot_end: end
      };
    });

    const { error } = await supabase.rpc("replace_availability_slots", {
      p_owner_type: ownerType,
      p_owner_id: ownerId,
      p_slots: slots
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(text.saved);
    }

    setSaving(false);
  }

  return (
    <section className="panel scheduler">
      <div className="week-tabs">
        {weeks.map((week) => (
          <button
            key={week.index}
            type="button"
            className={week.index === weekIndex ? "active" : ""}
            onClick={() => setWeekIndex(week.index)}
          >
            <strong>{weekLabel(week)}</strong>
            <span>{week.rangeLabel}</span>
          </button>
        ))}
      </div>

      <div className="quick-actions">
        <button type="button" onClick={() => setWeekSlots([0, 1, 2, 3, 4, 5, 6], true)}>
          {text.allWeek}
        </button>

        <button type="button" onClick={() => setWeekSlots([0, 1, 2, 3, 4], true)}>
          {text.weekdays}
        </button>

        <button type="button" onClick={() => setWeekSlots([5, 6], true)}>
          {text.weekend}
        </button>

        <button type="button" onClick={() => setWeekSlots([0, 1, 2, 3, 4, 5, 6], false)}>
          {text.clear}
        </button>

        <button type="button" className="primary inline" onClick={saveSlots} disabled={saving}>
          <Save size={16} />
          {saving ? text.saving : text.save}
        </button>

        {message ? <span className="success-text">{message}</span> : null}
      </div>

      <div className="schedule-scroll">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>{text.time}</th>
              {activeWeek.days.map((day, dayIndex) => (
                <th key={day.date}>{dayLabel(day, dayIndex)}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {slotTimes.map((time) => (
              <tr key={time}>
                <td>{time}</td>

                {activeWeek.days.map((day) => {
                  const key = slotKey(day, time);
                  const checked = selected.has(key);

                  return (
                    <td key={`${day.date}-${time}`}>
                      <button
                        type="button"
                        className={checked ? "slot selected" : "slot"}
                        onClick={() => toggleSlot(day, time)}
                      >
                        {checked ? text.available : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
