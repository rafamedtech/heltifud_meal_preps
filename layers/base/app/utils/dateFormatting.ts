const shortDateOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  timeZone: "America/Tijuana"
}

export function formatShortDate(date: string | Date): string {
  // A civil date has no timezone; midnight UTC must keep its calendar day.
  const civilDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
  return new Intl.DateTimeFormat("es-MX", {
    ...shortDateOptions,
    ...(civilDate ? { timeZone: "UTC" } : {})
  }).format(new Date(date))
}
