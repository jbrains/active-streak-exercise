import { skip, test } from "zora";
import { DateTime } from "luxon";

const formatDurationInDays = (n) => `${n} day${n === 1 ? "" : "s"}`;

const formatActiveStreak = (asOfDateAsText) => (measurements) =>
  formatDurationInDays(
    activeStreak(DateTime.fromISO(asOfDateAsText).startOf("day"))(
      measurements.map((m) => DateTime.fromISO(m.date).startOf("day"))
    )
  );

const activeStreak = (asOfDate) => (datesSortedByMostRecent) =>
  datesSortedByMostRecent.length === 0
    ? 0
    : startDateOfStreak(asOfDate, datesSortedByMostRecent[0]) === undefined
    ? 0
    : 1;

const startDateOfStreak = (asOfDate, mostRecentDate) => {
  let yesterday = asOfDate.minus({ days: 1 });
  return mostRecentDate.equals(asOfDate)
    ? asOfDate
    : mostRecentDate.equals(yesterday)
    ? yesterday
    : undefined;
};

const go = (asOfDate, datesSortedByMostRecent) =>
  datesSortedByMostRecent.length === 0
    ? 0
    : asOfDate === datesSortedByMostRecent[0]
    ? 1
    : 0;

// ===== Test Helpers =====
const date = (iso8601Text) => DateTime.fromISO(iso8601Text).startOf("day");

test("luxon", (t) => {
  t.notOk(
    date("2022-02-01") === date("2022-02-01"),
    "Same ISO Date strings are not equal with ==="
  );
  t.notOk(
    date("2022-02-01") == date("2022-02-01"),
    "Same ISO Date strings are not equal with =="
  );
  t.ok(
    date("2022-02-01").equals(date("2022-02-01")),
    "Same ISO Date strings are equal with equals()"
  );
  t.equal(
    date("2022-02-01"),
    date("2022-02-01"),
    "Same ISO Date strings are equal with equals()"
  );
  t.ok(date("2022-01-30") < date("2022-01-31"));
});

test("start date of streak", (t) => {
  t.equal(
    startDateOfStreak(date("2022-02-01"), date("2022-02-01")),
    date("2022-02-01"),
    "Start date of streak, when we match today"
  );
});

test("active streak", (t) => {
  const activeStreakFromDatesAsText = (datesAsText) =>
    activeStreak(date("2022-02-01"))(datesAsText.map((each) => date(each)));

  t.equal(activeStreakFromDatesAsText([]), 0, "no dates, no streak");

  test("active streak, 1 date", (t) => {
    t.equal(
      activeStreakFromDatesAsText(["2022-02-01"]),
      1,
      "streak from today"
    );
    t.equal(
      activeStreakFromDatesAsText(["2022-01-31"]),
      1,
      "streak from yesterday"
    );
    t.equal(
      activeStreakFromDatesAsText(["2022-01-30"]),
      0,
      "no streak: date too early"
    );
  });
});

skip("quarantined tests for active streak", (t) => {
  const activeStreakFromDatesAsText = (datesAsText) =>
    activeStreak(DateTime.fromISO("2022-02-01"))(
      datesAsText.map((each) => DateTime.fromISO(each))
    );

  t.equal(
    startDateOfStreak(date("2022-02-01"), date("2022-01-30")),
    undefined,
    "Start date of streak, when it doesn't match"
  );
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

  t.equal(
    activeStreakFromDatesAsText(["2022-01-30", "2022-01-29"]),
    0,
    "Streak of 2 days, but it starts before yesterday"
  );
  t.equal(
    activeStreakFromDatesAsText(["2022-01-31", "2022-01-30"]),
    2,
    "Streak of 2 days that starts yesterday"
  );
});

skip("quarantined tests for end to end", (t) => {
  t.equal(formatActiveStreak("2022-02-01")([]), "0 days");
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-02-01" }]), "1 day");
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-01-31" }]), "1 day");
  t.equal(formatActiveStreak("2022-02-01")([{ date: "2022-01-30" }]), "0 days");
});
