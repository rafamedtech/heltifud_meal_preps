const shortDateOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  timeZone: "America/Tijuana"
}

export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-MX", shortDateOptions).format(new Date(date))
}
