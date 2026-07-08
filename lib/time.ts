const halfHourMs = 30 * 60 * 1000;
const dayMs = 24 * 60 * 60 * 1000;

export const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
export const slotTimes = ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];

export function nextMonday(base = new Date()) {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + (day === 1 ? 7 : 8 - day));
  return date;
}

export function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function buildWeeks() {
  const start = nextMonday();
  return Array.from({ length: 8 }, (_, weekIndex) => {
    const first = new Date(start.getTime() + weekIndex * 7 * dayMs);
    const days = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(first.getTime() + dayIndex * dayMs);
      return {
        date,
        iso: isoDate(date),
        label: `${weekdays[dayIndex]} ${date.getMonth() + 1}/${date.getDate()}`
      };
    });
    return {
      index: weekIndex,
      label: `第 ${weekIndex + 1} 周`,
      range: `${first.getMonth() + 1}/${first.getDate()}-${days[6].date.getMonth() + 1}/${days[6].date.getDate()}`,
      days
    };
  });
}

export function slotToUtc(dateIso: string, time: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const start = new Date(year, month - 1, day, hour, minute);
  const end = new Date(start.getTime() + halfHourMs);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", weekday: "short" }),
    time: date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false })
  };
}
