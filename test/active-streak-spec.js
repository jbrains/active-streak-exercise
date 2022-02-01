import { test } from "zora";
import { DateTime } from "luxon";

const activeStreak = (datesSortedByMostRecent) =>
  datesSortedByMostRecent.length === 0
    ? 0
    : datesSortedByMostRecent[0] < DateTime.fromISO("2022-01-31")
    ? 0
    : 1;

const formatActiveStreak = (measurements) =>
  formatDurationInDays(
    activeStreak(measurements.map((m) => DateTime.fromISO(m.date)))
  );

const formatDurationInDays = (n) => `${n} day${n === 1 ? "" : "s"}`;

test("end to end", (t) => {
  t.equal(formatActiveStreak([]), "0 days");
  t.equal(formatActiveStreak([{ date: "2022-02-01" }]), "1 day");
  t.equal(formatActiveStreak([{ date: "2022-01-31" }]), "1 day");
  t.ok(DateTime.fromISO("2022-01-30") < DateTime.fromISO("2022-01-31"));
  t.equal(formatActiveStreak([{ date: "2022-01-30" }]), "0 days");
});
