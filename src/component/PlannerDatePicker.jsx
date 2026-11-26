import { useEffect, useRef, useState } from "react";

// The pop-up month calendar used for dates in 行程規劃 and 機票住宿.
const weekdayOf = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "" : "日一二三四五六"[date.getDay()];
};

export const toDateInputValue = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function PlannerDatePicker({ value, onChange, className = "", placeholder = "選擇日期" }) {
  const rootRef = useRef(null);
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const [open, setOpen] = useState(false);
  // What the calendar shows: the days of a month, or a grid of years or
  // months to jump to (tap the year or month in its heading).
  const [view, setView] = useState("days");
  const [visibleMonth, setVisibleMonth] = useState(
    () => selectedDate ?? new Date(),
  );

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const moveMonth = (offset) =>
    setVisibleMonth(new Date(year, month + offset, 1));
  // Twelve years at a time, the one on show among them; the arrows page
  // through them.
  const [yearPage, setYearPage] = useState(0);
  const firstYear = year - 4 + yearPage * 12;
  const years = Array.from({ length: 12 }, (_, index) => firstYear + index);
  const showView = (next) => {
    setYearPage(0);
    setView((current) => (current === next ? "days" : next));
  };
  const step = (offset) => {
    if (view === "years") setYearPage((page) => page + offset);
    else if (view === "months") setVisibleMonth(new Date(year + offset, month, 1));
    else moveMonth(offset);
  };
  const selectDate = (day) => {
    onChange(toDateInputValue(new Date(year, month, day)));
    setOpen(false);
  };
  const chooseToday = () => {
    const today = new Date();
    setVisibleMonth(today);
    onChange(toDateInputValue(today));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`planner-calendar ${className}`.trim()}>
      <button
        className="planner-calendar-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setVisibleMonth(selectedDate ?? new Date());
          setView("days");
          setOpen((current) => !current);
        }}
      >
        <span>
          {value ? value.replaceAll("-", "/") : placeholder}
          {value && (
            <span className="planner-calendar-weekday">({weekdayOf(value)})</span>
          )}
        </span>
        <span className="planner-calendar-icon" aria-hidden="true" />
      </button>
      {open && (
        <div
          className="planner-calendar-popover"
          role="dialog"
          aria-label="選擇日期"
        >
          <div className="planner-calendar-head">
            <strong className="planner-calendar-pick">
              <button
                type="button"
                className={view === "years" ? "is-open" : undefined}
                aria-expanded={view === "years"}
                onClick={() => showView("years")}
              >
                {year} 年
              </button>
              <button
                type="button"
                className={view === "months" ? "is-open" : undefined}
                aria-expanded={view === "months"}
                onClick={() => showView("months")}
              >
                {month + 1} 月
              </button>
            </strong>
            <div>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={view === "years" ? "前幾年" : view === "months" ? "前一年" : "上個月"}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={view === "years" ? "後幾年" : view === "months" ? "後一年" : "下個月"}
              >
                ↓
              </button>
            </div>
          </div>
          {view === "years" && (
            <div className="planner-calendar-grid">
              {years.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={option === year ? "is-selected" : undefined}
                  onClick={() => {
                    setVisibleMonth(new Date(option, month, 1));
                    setView("months");
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          {view === "months" && (
            <div className="planner-calendar-grid">
              {Array.from({ length: 12 }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === month ? "is-selected" : undefined}
                  onClick={() => {
                    setVisibleMonth(new Date(year, index, 1));
                    setView("days");
                  }}
                >
                  {index + 1} 月
                </button>
              ))}
            </div>
          )}
          {view === "days" && (
            <>
          <div className="planner-calendar-weekdays" aria-hidden="true">
            {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
              <span key={day}>{day}</span>
            ))}
            </div>
            <div className="planner-calendar-days">
            {calendarDays.map((day, index) =>
              day ? (
                <button
                  className={
                    value === toDateInputValue(new Date(year, month, day))
                      ? "is-selected"
                      : ""
                  }
                  type="button"
                  key={`${year}-${month}-${day}`}
                  onClick={() => selectDate(day)}
                >
                  {day}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              ),
            )}
            </div>
            </>
          )}
          <div className="planner-calendar-actions">
            <button type="button" onClick={chooseToday}>
              今天
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlannerDatePicker;
