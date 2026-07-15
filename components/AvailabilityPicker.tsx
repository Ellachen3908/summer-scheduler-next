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
    () => new Set(initialSlots.map(slot => slot.slot_start))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const activeWeek = weeks[weekIndex];
  const isTeacher = ownerType === "teacher";

  const text = isTeacher
    ? {
        allWeek: "Available All Week（整周可用）",
        weekday: "Weekdays Available（周一到周五可用）",
        weekend: "Weekend Available（周末可用）",
        clear: "Clear This Week（清空本周）",
        saving: "Saving（保存中）",
        save: "Save Availability（保存时间）",
        saved: "Availability Saved（时间已保存）",
        time: "Time（时间）",
        available: "Available（可用）"
      }
    : {
        allWeek: "整周可用",
        weekday: "周一到周五可用",
        weekend: "周末可用",
        clear: "清空本周",
        saving: "保存中",
        save: "保存时间",
        saved: "时间已保存",
        time: "时间",
        available: "可用"
      };

  function hasSlot(dateIso: string, time: string) {
    return selected.has(slotToUtc(dateIso, time).start);
  }

  function toggle(dateIso: string, time: string) {
    const { start } = slotToUtc(dateIso, time);

    setSelected(prev => {
      const next = new Set(prev);

      if (next.has(start)) {
        next.delete(start);
      } else {
        next.add(start);
      }

      return next;
    });
  }

  function fill(scope: "all" | "weekday" | "weekend", value: boolean) {
    setSelected(prev => {
      const next = new Set(prev);

      activeWeek.days.forEach((day, dayIndex) => {
        const isWeekend = dayIndex >= 5;

        if (scope === "weekday" && isWeekend) return;
        if (scope === "weekend" && !isWeekend) return;

        slotTimes.forEach(time => {
          const { start } = slotToUtc(day.iso, time);

          if (value) {
            next.add(start);
          } else {
            next.delete(start);
          }
        });
      });

      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const slots = Array.from(selected).map(start => ({
      slot_start: start,
      slot_end: new Date(new Date(start).getTime() + 30 * 60 * 1000).toISOString()
    }));

    const { error } = await supabase.rpc("replace_availability_slots", {
      p_owner_type: ownerType,
      p_owner_id: ownerId,
      p_slots: slots
    });

    setSaving(false);
    setMessage(error ? error.message : text.saved);
  }

  return (
    <section className="panel">
      <div className="weekbar">
        {weeks.map(week => (
          <button
            key={week.index}
            className={week.index === weekIndex ? "active" : ""}
            onClick={() => setWeekIndex(week.index)}
          >
            <span>{week.label}</span>
            <small>{week.range}</small>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <button onClick={() => fill("all", true)}>{text.allWeek}</button>
        <button onClick={() => fill("weekday", true)}>{text.weekday}</button>
        <button onClick={() => fill("weekend", true)}>{text.weekend}</button>
        <button onClick={() => fill("all", false)}>{text.clear}</button>

        <button className="primary" onClick={save} disabled={saving}>
          <Save size={16} /> {saving ? text.saving : text.save}
        </button>

        {message && <span className="status-text">{message}</span>}
      </div>

      <div className="grid-scroll">
        <div className="schedule-grid">
          <div className="cell head">{text.time}</div>

          {activeWeek.days.map(day => (
            <div className="cell head" key={day.iso}>
              {day.label}
            </div>
          ))}

          {slotTimes.flatMap(time => [
            <div className="cell time" key={`time-${time}`}>
              {time}
            </div>,
            ...activeWeek.days.map(day => {
              const active = hasSlot(day.iso, time);

              return (
                <div className="cell" key={`${day.iso}-${time}`}>
                  <button
                    className={`slot ${active ? "selected" : ""}`}
                    onClick={() => toggle(day.iso, time)}
                  >
                    {active ? text.available : ""}
                  </button>
                </div>
              );
            })
          ])}
        </div>
      </div>
    </section>
  );
}
