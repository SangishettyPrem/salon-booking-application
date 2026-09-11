export const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const clean = time.trim().toUpperCase();
  const isPM = clean.includes("PM");
  const isAM = clean.includes("AM");
  const timePart = clean.replace(/[AP]M/, "").trim();
  const [hStr = "0", mStr = "0"] = timePart.split(":");
  let hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const getDayKey = (date: string): string => {
  return new Date(`${date}T00:00:00`)
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toLowerCase();
};
