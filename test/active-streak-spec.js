import { test } from "zora";
import { DateTime } from "luxon";

const isBeforeYesterday = (date) => date < DateTime.fromISO("2022-01-31");
const activeStreak = (measurements) =>
  measurements.length > 0
    ? isBeforeYesterday(DateTime.fromISO(measurements[0].date))
      ? "0 days"
      : "1 day"
    : "0 days";

test("end to end", (t) => {
  t.equal(activeStreak([]), "0 days");
  t.equal(activeStreak([{ date: "2022-02-01" }]), "1 day");
  t.equal(activeStreak([{ date: "2022-01-31" }]), "1 day");
  t.equal(activeStreak([{ date: "2022-01-30" }]), "0 days");
});
