import { test } from "zora";
import { DateTime } from "luxon";

const formatDurationInDays = (n) => `${n} day${n === 1 ? "" : "s"}`;

const formatActiveStreak = (asOfDateAsText) => (measurements) =>
  formatDurationInDays(
    activeStreak(DateTime.fromISO(asOfDateAsText))(
      measurements.map((m) => DateTime.fromISO(m.date))
    )
  );

const activeStreak = (asOfDate) => (datesSortedByMostRecent) =>
  datesSortedByMostRecent.length === 0
    ? 0
    : datesSortedByMostRecent[0] < asOfDate.minus({ days: 1 })
    ? 0
    : 1 + go(asOfDate.minus({ days: 1 }), datesSortedByMostRecent.slice(1));

const go = (asOfDate, datesSortedByMostRecent) =>
  datesSortedByMostRecent.length === 0
    ? 0
    : asOfDate.toISODate() === datesSortedByMostRecent[0].toISODate()
    ? 1
    : 0;

test("active streak", (t) => {
  const activeStreakFromDatesAsText = (datesAsText) =>
    activeStreak(DateTime.fromISO("2022-02-01"))(
      datesAsText.map((each) => DateTime.fromISO(each))
    );

  t.equal(activeStreakFromDatesAsText([]), 0);
  t.equal(activeStreakFromDatesAsText(["2022-02-01"]), 1);
  t.equal(activeStreakFromDatesAsText(["2022-01-31"]), 1);
  t.equal(activeStreakFromDatesAsText(["2022-01-30"]), 0);

  t.equal(activeStreakFromDatesAsText(["2022-02-01", "2022-01-31"]), 2);
  t.equal(["2022-02-01", "2022-01-31"].slice(1), ["2022-01-31"]);
  t.equal(DateTime.fromISO("2022-01-31"), DateTime.fromISO("2022-01-31"));
  t.equal(
    go(DateTime.fromISO("2022-01-31"), [DateTime.fromISO("2022-01-31")]),
    1
  );
  t.equal(go(DateTime.fromISO("2022-01-30"), []), 0);

  t.equal(
    go(DateTime.fromISO("2022-01-31"), [DateTime.fromISO("2022-01-30")]),
    0
  );
  t.equal(activeStreakFromDatesAsText(["2022-02-01", "2022-01-30"]), 1);
});

test("end to end", (t) => {
  t.equal(formatActiveStreak("2022-02-01")([]), "0 days");
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-02-01" }]), "1 day");
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-01-31" }]), "1 day");
  t.ok(DateTime.fromISO("2022-01-30") < DateTime.fromISO("2022-01-31"));
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-01-30" }]), "0 days");
});
