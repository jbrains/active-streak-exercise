import { test } from "zora";
import { DateTime } from "luxon";

const activeStreak = (asOfDate) => (datesSortedByMostRecent) =>
  datesSortedByMostRecent.length === 0
    ? 0
    : datesSortedByMostRecent[0] < asOfDate.minus({ days: 1 })
    ? 0
    : 1;

const formatActiveStreak = (measurements) =>
  formatDurationInDays(
    activeStreak(DateTime.fromISO("2022-02-01"))(
      measurements.map((m) => DateTime.fromISO(m.date))
    )
  );

const formatDurationInDays = (n) => `${n} day${n === 1 ? "" : "s"}`;

test("active streak", (t) => {
  const activeStreakFromDatesAsText = (datesAsText) =>
    activeStreak(DateTime.fromISO("2022-02-01"))(
      datesAsText.map((each) => DateTime.fromISO(each))
    );

  t.equal(activeStreakFromDatesAsText([]), 0);
  t.equal(activeStreakFromDatesAsText(["2022-02-01"]), 1);
  t.equal(activeStreakFromDatesAsText(["2022-01-31"]), 1);
  t.equal(activeStreakFromDatesAsText(["2022-01-30"]), 0);
});

test("end to end", (t) => {
  t.equal(formatActiveStreak([]), "0 days");
  t.equal(formatActiveStreak([{ date: "2022-02-01" }]), "1 day");
  t.equal(formatActiveStreak([{ date: "2022-01-31" }]), "1 day");
  t.ok(DateTime.fromISO("2022-01-30") < DateTime.fromISO("2022-01-31"));
  t.equal(formatActiveStreak([{ date: "2022-01-30" }]), "0 days");
});
