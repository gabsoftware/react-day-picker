import * as React from 'react';
import React__default from 'react';
import { startOfWeek, addDays, endOfWeek, differenceInCalendarDays, startOfMonth, endOfMonth, getWeek, getMonth, getWeeksInMonth, addWeeks, differenceInCalendarMonths, addMonths, isSameMonth, isSameYear, setMonth, setYear, startOfYear, isDate, isSameDay, isBefore, isAfter, startOfDay, format, parse, getUnixTime } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

/**
 * The DayPicker context shares the props passed to DayPicker within the
 * internal components. It is used to set the default values and  perform
 * one-time calculations required to render the days.
 *
 * Access this context from the [[useDayPicker]] hook when using custom
 * components.
 */
var DayPickerContext = React.createContext(undefined);

/**
 * Hook to access the [[DayPickerContext]].
 *
 * To use this hook make sure to wrap the components with a one
 * [[DayPickerProvider]].
 * */
function useDayPicker() {
    var context = React.useContext(DayPickerContext);
    if (!context) {
        throw new Error("Context is not defined. useDayPicker must be used within a DayPickerProvider with a valid values.");
    }
    return context;
}

/**
 * Generate a series of 7 days, starting from the week, to use for formatting
 * the weekday names (Monday, Tuesday, etc.).
 */
function getWeekdays(locale) {
    var start = startOfWeek(new Date(), { locale: locale });
    var days = [];
    for (var i = 0; i < 7; i++) {
        var day = addDays(start, i);
        days.push(day);
    }
    return days;
}

/**
 * Render the Head component - i.e. the table head with the weekday names.
 */
function Head() {
    var _a = useDayPicker(), classNames = _a.classNames, styles = _a.styles, showWeekNumber = _a.showWeekNumber, locale = _a.locale, formatWeekdayName = _a.formatters.formatWeekdayName, labelWeekday = _a.labels.labelWeekday;
    var weekdays = getWeekdays(locale);
    return (React.createElement("thead", { style: styles.head, className: classNames.head },
        React.createElement("tr", { style: styles.head_row, className: classNames.head_row },
            showWeekNumber && (React.createElement("th", { scope: "col", style: styles.head_cell, className: classNames.head_cell })),
            weekdays.map(function (weekday, i) { return (React.createElement("th", { key: i, scope: "col", className: classNames.head_cell, style: styles.head_cell },
                React.createElement("span", { className: classNames.vhidden, "aria-label": "" }, labelWeekday(weekday, { locale: locale })),
                React.createElement("span", { "aria-hidden": true }, formatWeekdayName(weekday, { locale: locale })))); }))));
}

function getOutsideEndDays(month, options) {
    var days = [];
    var lastDayOfWeek = endOfWeek(month, options);
    var endDiff = differenceInCalendarDays(lastDayOfWeek, month);
    for (var i = 1; i <= endDiff; i++) {
        var dayDate = addDays(month, i);
        days.push(dayDate);
    }
    return days;
}

function getOutsideStartDays(month, options) {
    var days = [];
    var firstDayOfWeek = startOfWeek(month, options);
    var startDiff = differenceInCalendarDays(month, firstDayOfWeek);
    for (var i = 0; i < startDiff; i++) {
        var newDay = addDays(firstDayOfWeek, i);
        days.push(newDay);
    }
    return days;
}

/**
 * Return the weeks belonging to the given month.
 */
function getWeeks(month, _a) {
    var locale = _a.locale, fixedWeeks = _a.fixedWeeks;
    var monthStart = startOfMonth(month);
    var monthEnd = endOfMonth(month);
    var diff = differenceInCalendarDays(monthEnd, monthStart);
    var weeks = {};
    var lastWeekStr = '';
    for (var i = 0; i <= diff; i++) {
        var date = addDays(monthStart, i);
        var week = getWeek(date, { locale: locale });
        if (week === 1 && getMonth(date) === 11) {
            week = 53;
        }
        var weekStr = week.toString();
        if (!weeks[weekStr]) {
            var startDays = getOutsideStartDays(date, { locale: locale });
            // Create a new week by adding outside start days
            weeks[weekStr] = startDays;
        }
        weeks[weekStr].push(date);
        lastWeekStr = weekStr;
    }
    var lastWeek = weeks[lastWeekStr];
    var lastDay = lastWeek[lastWeek.length - 1];
    var endDays = getOutsideEndDays(lastDay, { locale: locale });
    weeks[lastWeekStr] = lastWeek.concat(endDays);
    // Add extra weeks to the month, up to 6 weeks
    if (fixedWeeks) {
        lastWeek = weeks[lastWeekStr];
        var lastWeekDate = lastWeek[lastWeek.length - 1];
        var weeksInMonth = getWeeksInMonth(month, { locale: locale });
        if (weeksInMonth < 6) {
            var diffDays = differenceInCalendarDays(addWeeks(lastWeekDate, 6 - weeksInMonth), lastWeekDate);
            for (var i = 0; i < diffDays; i++) {
                var date = addDays(lastWeekDate, i + 1);
                var week = getWeek(date, { locale: locale });
                if (week === 1 && getMonth(month) === 11) {
                    week = 53;
                }
                if (!weeks[week]) {
                    weeks[week] = [];
                }
                weeks[week.toString()].push(date);
            }
        }
    }
    return weeks;
}

/**
 * Render the table with the calendar.
 */
function Table(props) {
    var _a = useDayPicker(), locale = _a.locale, classNames = _a.classNames, styles = _a.styles, hideHead = _a.hideHead, fixedWeeks = _a.fixedWeeks, _b = _a.components, Row = _b.Row, Footer = _b.Footer;
    var weeks = getWeeks(props.displayMonth, { locale: locale, fixedWeeks: fixedWeeks });
    return (React.createElement("table", { className: classNames.table, style: styles.table },
        !hideHead && React.createElement(Head, null),
        React.createElement("tbody", { className: classNames.tbody, style: styles.tbody }, Object.keys(weeks).map(function (weekNumber) { return (React.createElement(Row, { displayMonth: props.displayMonth, key: weekNumber, dates: weeks[weekNumber], weekNumber: Number(weekNumber) })); })),
        React.createElement(Footer, null)));
}

/**
 * The Navigation context shares details about the months being navigated in DayPicker.
 *
 * Access this context from the [[useNavigation]] hook.
 */
var NavigationContext = React.createContext(undefined);

/** Return the initial month according to the given options. */
function getInitialMonth(context) {
    var month = context.month, defaultMonth = context.defaultMonth, today = context.today;
    var initialMonth = month || defaultMonth || today || new Date();
    var toDate = context.toDate, fromDate = context.fromDate, _a = context.numberOfMonths, numberOfMonths = _a === void 0 ? 1 : _a;
    // Fix the initialMonth if is after the to-date
    if (toDate && differenceInCalendarMonths(toDate, initialMonth) < 0) {
        var offset = -1 * (numberOfMonths - 1);
        initialMonth = addMonths(toDate, offset);
    }
    // Fix the initialMonth if is before the from-date
    if (fromDate && differenceInCalendarMonths(initialMonth, fromDate) < 0) {
        initialMonth = fromDate;
    }
    return startOfMonth(initialMonth);
}

/** Controls the navigation state. */
function useNavigationState() {
    var context = useDayPicker();
    var initialMonth = getInitialMonth(context);
    var _a = React.useState(initialMonth), month = _a[0], setMonth = _a[1];
    var goToMonth = function (date) {
        if (context.disableNavigation)
            return;
        setMonth(date);
    };
    // Update month if updated from context.
    React.useEffect(function () {
        // TODO: return void also if `context.defaultMonth`?
        if (!context.month)
            return;
        if (isSameMonth(context.month, month))
            return;
        setMonth(context.month);
    }, [context.month]);
    return [month, goToMonth];
}

/**
 * Return the months to display in the component according to the number of
 * months and the from/to date.
 */
function getDisplayMonths(month, _a) {
    var reverseMonths = _a.reverseMonths, numberOfMonths = _a.numberOfMonths;
    var start = startOfMonth(month);
    var end = startOfMonth(addMonths(start, numberOfMonths));
    var monthsDiff = differenceInCalendarMonths(end, start);
    var months = [];
    for (var i = 0; i < monthsDiff; i++) {
        var nextMonth = addMonths(start, i);
        months.push(nextMonth);
    }
    if (reverseMonths)
        months = months.reverse();
    return months;
}

/**
 * Returns the next month the user can navigate to according to the given
 * options.
 *
 * Please note that the next month is not always the next calendar month:
 *
 * - if after the `toDate` range, is undefined;
 * - if the navigation is paged, is the number of months displayed ahead.
 *
 */
function getNextMonth(startingMonth, options) {
    if (options.disableNavigation) {
        return undefined;
    }
    var toDate = options.toDate, pagedNavigation = options.pagedNavigation, _a = options.numberOfMonths, numberOfMonths = _a === void 0 ? 1 : _a;
    var offset = pagedNavigation ? numberOfMonths : 1;
    var month = startOfMonth(startingMonth);
    if (!toDate) {
        return addMonths(month, offset);
    }
    var monthsDiff = differenceInCalendarMonths(toDate, startingMonth);
    if (monthsDiff < numberOfMonths) {
        return undefined;
    }
    // Jump forward as the number of months when paged navigation
    return addMonths(month, offset);
}

/**
 * Returns the next previous the user can navigate to, according to the given
 * options.
 *
 * Please note that the previous month is not always the previous calendar
 * month:
 *
 * - if before the `fromDate` date, is `undefined`;
 * - if the navigation is paged, is the number of months displayed before.
 *
 */
function getPreviousMonth(startingMonth, options) {
    if (options.disableNavigation) {
        return undefined;
    }
    var fromDate = options.fromDate, pagedNavigation = options.pagedNavigation, _a = options.numberOfMonths, numberOfMonths = _a === void 0 ? 1 : _a;
    var offset = pagedNavigation ? numberOfMonths : 1;
    var month = startOfMonth(startingMonth);
    if (!fromDate) {
        return addMonths(month, -offset);
    }
    var monthsDiff = differenceInCalendarMonths(month, fromDate);
    if (monthsDiff <= 0) {
        return undefined;
    }
    // Jump back as the number of months when paged navigation
    return addMonths(month, -offset);
}

/** Provides the values for the [[NavigationContext]]. */
function NavigationProvider(props) {
    var context = useDayPicker();
    var _a = useNavigationState(), month = _a[0], goToMonth = _a[1];
    var displayMonths = getDisplayMonths(month, context);
    var nextMonth = getNextMonth(month, context);
    var previousMonth = getPreviousMonth(month, context);
    return (React.createElement(NavigationContext.Provider, { value: {
            month: month,
            displayMonths: displayMonths,
            goToMonth: goToMonth,
            previousMonth: previousMonth,
            nextMonth: nextMonth
        } }, props.children));
}

/** Hook to access the [[NavigationContext]]. */
function useNavigation() {
    var context = React.useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}

/**
 * Render the container with the months and their captions. The number of months
 * rendered depends by the `numberOfMonths` prop.
 */
function Root() {
    var _a = useDayPicker(), dir = _a.dir, className = _a.className, classNames = _a.classNames, style = _a.style, styles = _a.styles, numberOfMonths = _a.numberOfMonths, showWeekNumber = _a.showWeekNumber, Caption = _a.components.Caption;
    var displayMonths = useNavigation().displayMonths;
    var rootClassNames = [className !== null && className !== void 0 ? className : classNames.root];
    if (numberOfMonths > 1) {
        rootClassNames.push(classNames.multiple_month);
    }
    if (showWeekNumber) {
        rootClassNames.push(classNames.with_weeknumber);
    }
    if (className)
        rootClassNames.concat(className.split(' '));
    var renderMonth = function (displayMonth, displayIndex) {
        var _a;
        var className = [classNames.month];
        var style = __assign({}, styles.month);
        var isFirst = displayIndex === 0;
        var isLast = displayIndex === displayMonths.length - 1;
        if (dir === 'rtl')
            _a = [isFirst, isLast], isLast = _a[0], isFirst = _a[1];
        if (isFirst) {
            className.push(classNames.caption_first);
            Object.assign(style, styles.caption_first);
        }
        if (isLast)
            className.push(classNames.caption_last);
        if (!isFirst && !isLast)
            className.push(classNames.caption_middle);
        return (React.createElement("div", { key: displayIndex, className: className.join(' '), style: style },
            React.createElement(Caption, { displayMonth: displayMonth }),
            React.createElement(Table, { displayMonth: displayMonth })));
    };
    return (React.createElement("div", { className: rootClassNames.join(' '), style: __assign(__assign({}, styles.root), style), dir: dir },
        React.createElement("div", { className: classNames.months, style: styles.months }, displayMonths.map(renderMonth))));
}

/**
 * Render the dropdown to navigate between months.
 */
function MonthsDropdown(props) {
    var displayMonth = props.displayMonth;
    var _a = useDayPicker(), fromDate = _a.fromDate, toDate = _a.toDate, styles = _a.styles, locale = _a.locale, formatMonthCaption = _a.formatters.formatMonthCaption, classNames = _a.classNames, Dropdown = _a.components.Dropdown, labelMonthDropdown = _a.labels.labelMonthDropdown;
    if (!fromDate && !toDate) {
        // TODO: use type guards
        return React.createElement(React.Fragment, null);
    }
    var dropdownMonths = [];
    if (fromDate && toDate) {
        if (isSameYear(fromDate, toDate)) {
            // only display the months included in the range
            for (var month = fromDate.getMonth(); month <= toDate.getMonth(); month++) {
                dropdownMonths.push(setMonth(startOfMonth(fromDate), month));
            }
        }
        else {
            // display all the 12 months
            for (var month = 0; month <= 11; month++) {
                var anyDate = new Date(); // any date is OK, we just need the year
                dropdownMonths.push(setMonth(startOfMonth(anyDate), month));
            }
        }
    }
    var handleChange = function (e) {
        var newMonth = setMonth(new Date(displayMonth), Number(e.target.value));
        props.onChange(newMonth);
    };
    return (React.createElement(Dropdown, { "aria-label": labelMonthDropdown(), className: classNames.dropdown_month, style: styles.dropdown_month, onChange: handleChange, value: displayMonth.getMonth(), caption: formatMonthCaption(displayMonth, { locale: locale }) }, dropdownMonths.map(function (m) { return (React.createElement("option", { key: m.getMonth(), value: m.getMonth() }, formatMonthCaption(m, { locale: locale }))); })));
}

/**
 * Render a button HTML element applying the reset class name.
 */
var Button = React.forwardRef(function (props, ref) {
    var _a = useDayPicker(), classNames = _a.classNames, styles = _a.styles;
    var classNamesArr = [classNames.button_reset, classNames.button];
    if (props.className) {
        classNamesArr.push(props.className);
    }
    var className = classNamesArr.join(' ');
    var style = __assign(__assign({}, styles.button_reset), styles.button);
    if (props.style) {
        Object.assign(style, props.style);
    }
    return (React.createElement("button", __assign({}, props, { ref: ref, type: "button", className: className, style: style })));
});

/** A component rendering the navigation buttons or the drop-downs. */
function Navigation(props) {
    var _a;
    var _b = useDayPicker(), dir = _b.dir, locale = _b.locale, classNames = _b.classNames, styles = _b.styles, _c = _b.labels, labelPrevious = _c.labelPrevious, labelNext = _c.labelNext, _d = _b.components, IconNext = _d.IconNext, IconPrevious = _d.IconPrevious;
    var onPreviousClick = props.onPreviousClick, onNextClick = props.onNextClick;
    if (dir === 'rtl') {
        _a = [onPreviousClick, onNextClick], onNextClick = _a[0], onPreviousClick = _a[1];
    }
    var previousMonth = props.previousMonth, nextMonth = props.nextMonth;
    var previousLabel = labelPrevious(previousMonth, { locale: locale });
    var previousClassName = [
        classNames.nav_button,
        classNames.nav_button_previous
    ].join(' ');
    var nextLabel = labelNext(nextMonth, { locale: locale });
    var nextClassName = [
        classNames.nav_button,
        classNames.nav_button_previous
    ].join(' ');
    var previousButton = (React.createElement(Button, { key: "prev", "aria-label": previousLabel, className: previousClassName, style: styles.nav_button_previous, disabled: !previousMonth, onClick: onPreviousClick },
        React.createElement(IconPrevious, { className: classNames.nav_icon, style: styles.nav_icon })));
    var nextButton = (React.createElement(Button, { key: "next", "aria-label": nextLabel, className: nextClassName, disabled: !nextMonth, onClick: onNextClick, style: styles.nav_button_next },
        React.createElement(IconNext, { className: classNames.nav_icon, style: styles.nav_icon })));
    if (!nextMonth && !previousMonth) {
        return React.createElement(React.Fragment, null);
    }
    return (React.createElement("div", { className: classNames.nav, style: styles.nav },
        !props.hidePrevious && (dir === 'rtl' ? nextButton : previousButton),
        !props.hideNext && (dir === 'rtl' ? previousButton : nextButton)));
}

/**
 * Render a dropdown to change the year. Take in account the `nav.fromDate` and
 * `toDate` from context.
 */
function YearsDropdown(props) {
    var displayMonth = props.displayMonth;
    var _a = useDayPicker(), fromDate = _a.fromDate, toDate = _a.toDate, locale = _a.locale, styles = _a.styles, classNames = _a.classNames, Dropdown = _a.components.Dropdown, formatYearCaption = _a.formatters.formatYearCaption, labelYearDropdown = _a.labels.labelYearDropdown;
    var years = [];
    if (fromDate && toDate) {
        var fromYear = fromDate.getFullYear();
        var toYear = toDate.getFullYear();
        for (var year = fromYear; year <= toYear; year++) {
            years.push(setYear(startOfYear(new Date()), year));
        }
    }
    var handleChange = function (e) {
        var newMonth = setYear(new Date(displayMonth), Number(e.target.value));
        props.onChange(newMonth);
    };
    return (React.createElement(Dropdown, { "aria-label": labelYearDropdown(), className: classNames.dropdown_month, style: styles.dropdown_month, onChange: handleChange, value: displayMonth.getFullYear(), caption: formatYearCaption(displayMonth, { locale: locale }) }, years.map(function (year) { return (React.createElement("option", { key: year.getFullYear(), value: year.getFullYear() }, formatYearCaption(year, { locale: locale }))); })));
}

/**
 * Render the caption of a month, which includes title and navigation buttons.
 * The caption has a different layout when setting the `numberOfMonths` prop.
 */
function Caption(props) {
    var _a;
    var displayMonth = props.displayMonth;
    var context = useDayPicker();
    var classNames = context.classNames, numberOfMonths = context.numberOfMonths, disableNavigation = context.disableNavigation, styles = context.styles, captionLayout = context.captionLayout, onMonthChange = context.onMonthChange, dir = context.dir, CaptionLabel = context.components.CaptionLabel;
    var _b = useNavigation(), previousMonth = _b.previousMonth, nextMonth = _b.nextMonth, goToMonth = _b.goToMonth, displayMonths = _b.displayMonths;
    var handlePreviousClick = function (e) {
        if (!previousMonth)
            return;
        goToMonth(previousMonth);
        onMonthChange === null || onMonthChange === void 0 ? void 0 : onMonthChange(previousMonth);
    };
    var handleNextClick = function (e) {
        if (!nextMonth)
            return;
        goToMonth(nextMonth);
        onMonthChange === null || onMonthChange === void 0 ? void 0 : onMonthChange(nextMonth);
    };
    var handleMonthChange = function (newMonth) {
        goToMonth(newMonth);
        onMonthChange === null || onMonthChange === void 0 ? void 0 : onMonthChange(newMonth);
    };
    var displayIndex = displayMonths.findIndex(function (month) {
        return isSameMonth(displayMonth, month);
    });
    var isFirst = displayIndex === 0;
    var isLast = displayIndex === displayMonths.length - 1;
    if (dir === 'rtl') {
        _a = [isFirst, isLast], isLast = _a[0], isFirst = _a[1];
    }
    var captionLabel = React.createElement(CaptionLabel, { displayMonth: displayMonth });
    var hideNext = numberOfMonths > 1 && (isFirst || !isLast);
    var hidePrevious = numberOfMonths > 1 && (isLast || !isFirst);
    return (React.createElement("div", { className: classNames.caption, style: styles.caption },
        disableNavigation && captionLabel,
        !disableNavigation && (React.createElement(React.Fragment, null, captionLayout === 'dropdown' ? (React.createElement("div", { className: classNames.caption_dropdowns, style: styles.caption_dropdowns },
            React.createElement(MonthsDropdown, { onChange: handleMonthChange, displayMonth: displayMonth }),
            React.createElement(YearsDropdown, { onChange: handleMonthChange, displayMonth: displayMonth }))) : (React.createElement(React.Fragment, null,
            React.createElement(CaptionLabel, { displayMonth: displayMonth }),
            React.createElement(Navigation, { displayMonth: displayMonth, hideNext: hideNext, hidePrevious: hidePrevious, nextMonth: nextMonth, previousMonth: previousMonth, onPreviousClick: handlePreviousClick, onNextClick: handleNextClick })))))));
}

/** Render the caption for the displayed month. This component is used when `captionLayout="buttons"`. */
function CaptionLabel(props) {
    var _a = useDayPicker(), locale = _a.locale, classNames = _a.classNames, styles = _a.styles, formatCaption = _a.formatters.formatCaption;
    return (React.createElement("div", { key: "caption", className: classNames.caption_label, style: styles.caption_label, "aria-live": "polite", "aria-atomic": "true" }, formatCaption(props.displayMonth, { locale: locale })));
}

/** Returns true if `value` is an array of valid dates. */
function isArrayOfDates(value) {
    return Array.isArray(value) && value.every(isDate);
}

/** Returns true if `value` is of type [[DateAfter]]. */
function isDateAfterType(value) {
    return Boolean(value && typeof value === 'object' && 'after' in value);
}

/** Returns true if `value` is of type [[DateBefore]]. */
function isDateBeforeType(value) {
    return Boolean(value && typeof value === 'object' && 'before' in value);
}

/** Returns true if `matcher` is of type [[DateInterval]]. */
function isDateInterval(matcher) {
    return Boolean(matcher &&
        typeof matcher === 'object' &&
        'before' in matcher &&
        'after' in matcher);
}

/** Returns true if `value` is a [[DateRange]] type. */
function isDateRange(value) {
    // TODO: Check if dates?!
    return Boolean(value && typeof value === 'object' && 'from' in value);
}

/** Returns true if `value` is a Date type. */
function isDateType(value) {
    return isDate(value);
}

/** Returns true if `value` is a [[DayOfWeek]] type. */
function isDayOfWeekType(value) {
    return Boolean(value && typeof value === 'object' && 'dayOfWeek' in value);
}

/** Returns true when the props are of type [[DayPickerMultiple]]. */
function isDayPickerMultiple(props) {
    return props.mode === 'multiple';
}

/** Returns true when the props are of type [[DayPickerRange]]. */
function isDayPickerRange(props) {
    return props.mode === 'range';
}

/** Returns true when the props are of type [[DayPickerSingle]]. */
function isDayPickerSingle(props) {
    return props.mode === 'single';
}

/** Returns true when the props are of type [[DayPickerUncontrolled]]. */
function isDayPickerUncontrolled(props) {
    return props.mode === 'uncontrolled';
}

/**
 * The SelectMultiple context shares details about the selected days when in
 * multiple selection mode.
 *
 * Access this context from the [[useSelectMultiple]] hook.
 */
var SelectMultipleContext = React.createContext(undefined);

/** Provides the values for the [[SelectMultipleContext]]. */
function SelectMultipleProvider(_a) {
    var initialProps = _a.initialProps, children = _a.children;
    var initialSelected;
    if (isDayPickerMultiple(initialProps)) {
        initialSelected = initialProps.defaultSelected;
    }
    var _b = React.useState(initialSelected || undefined), selectedDays = _b[0], setSelectedDays = _b[1];
    var handleDayClick = function (day, modifiers, e) {
        var _a, _b;
        if (!isDayPickerMultiple(initialProps)) {
            return;
        }
        (_a = initialProps.onDayClick) === null || _a === void 0 ? void 0 : _a.call(initialProps, day, modifiers, e);
        var isMinSelected = Boolean(initialProps.min &&
            modifiers.selected &&
            selectedDays &&
            selectedDays.length === initialProps.min);
        if (isMinSelected) {
            return;
        }
        var isMaxSelected = Boolean(initialProps.max &&
            !modifiers.selected &&
            selectedDays &&
            selectedDays.length === initialProps.max);
        if (isMaxSelected) {
            return;
        }
        var days = selectedDays ? __spreadArrays(selectedDays) : [];
        if (modifiers.selected) {
            var index = days.findIndex(function (selectedDay) {
                return isSameDay(day, selectedDay);
            });
            days.splice(index, 1);
        }
        else {
            days.push(day);
        }
        setSelectedDays(days);
        (_b = initialProps.onSelect) === null || _b === void 0 ? void 0 : _b.call(initialProps, days, day, modifiers, e);
    };
    var modifiers = {
        selected: [],
        disabled: []
    };
    if (selectedDays && isDayPickerMultiple(initialProps)) {
        modifiers.selected = selectedDays;
        modifiers.disabled = [
            function disableDay(day) {
                var isMaxSelected = initialProps.max && selectedDays.length > initialProps.max - 1;
                var isSelected = selectedDays.some(function (selectedDay) {
                    return isSameDay(selectedDay, day);
                });
                return Boolean(isMaxSelected && !isSelected);
            }
        ];
    }
    return (React.createElement(SelectMultipleContext.Provider, { value: {
            selected: selectedDays,
            handleDayClick: handleDayClick,
            modifiers: modifiers
        } }, children));
}

/** Hook to access the [[SelectMultipleContext]]. */
function useSelectMultiple() {
    var context = React.useContext(SelectMultipleContext);
    if (!context) {
        throw new Error('useSelectMultiple must be used within a SelectMultipleProvider');
    }
    return context;
}

/**
 * The SelectRange context shares details about the selected days when in
 * range selection mode.
 *
 * Access this context from the [[useSelectRange]] hook.
 */
var SelectRangeContext = React.createContext(undefined);

/**
 * Add a day to an existing range.
 *
 * The returned range takes in account the `undefined` values and if the added
 * day is already present in the range.
 */
function addToRange(day, range) {
    var _a = range || {}, from = _a.from, to = _a.to;
    if (!from) {
        return { from: day, to: day };
    }
    if (!to && isSameDay(from, day)) {
        return undefined;
    }
    if (!to && isBefore(day, from)) {
        return { from: day, to: from };
    }
    if (!to) {
        return { from: from, to: day };
    }
    if (isSameDay(to, day) && isSameDay(from, day)) {
        return undefined;
    }
    if (isSameDay(to, day)) {
        return { from: to, to: to };
    }
    if (isSameDay(from, day)) {
        return undefined;
    }
    if (isAfter(from, day)) {
        return { from: day, to: to };
    }
    return { from: from, to: day };
}

/** Provides the values for the [[SelectRangeProvider]]. */
function SelectRangeProvider(_a) {
    var initialProps = _a.initialProps, children = _a.children;
    var initialSelected;
    var min, max;
    if (isDayPickerRange(initialProps)) {
        initialSelected = initialProps.defaultSelected;
        min = initialProps.min;
        max = initialProps.max;
    }
    var _b = React.useState(initialSelected), selected = _b[0], setSelected = _b[1];
    var handleDayClick = function (day, modifiers, e) {
        var _a, _b;
        (_a = initialProps.onDayClick) === null || _a === void 0 ? void 0 : _a.call(initialProps, day, modifiers, e);
        if (!isDayPickerRange(initialProps)) {
            return;
        }
        var newValue = addToRange(day, selected);
        if ((min || max) &&
            selected && (newValue === null || newValue === void 0 ? void 0 : newValue.to) &&
            newValue.from &&
            newValue.from !== newValue.to) {
            var diff = Math.abs(differenceInCalendarDays(newValue === null || newValue === void 0 ? void 0 : newValue.to, newValue === null || newValue === void 0 ? void 0 : newValue.from));
            if (min && diff < min) {
                return;
            }
            if (max && diff >= max) {
                return;
            }
        }
        setSelected(newValue);
        (_b = initialProps.onSelect) === null || _b === void 0 ? void 0 : _b.call(initialProps, newValue, day, modifiers, e);
    };
    var modifiers = {
        selected: [],
        range_start: [],
        range_end: [],
        range_middle: [],
        disabled: []
    };
    if (selected) {
        modifiers.selected = [selected];
        if (selected.from) {
            modifiers.range_start = [selected.from];
            if (selected.to) {
                modifiers.range_middle = [
                    {
                        after: selected.from,
                        before: selected.to
                    }
                ];
                if (max || min) {
                    modifiers.disabled = [
                        function (date) {
                            if (max &&
                                selected.to &&
                                selected.from &&
                                isBefore(date, selected.from)) {
                                var diff = differenceInCalendarDays(selected.to, date);
                                if (diff >= max) {
                                    return true;
                                }
                            }
                            if (max &&
                                selected.to &&
                                selected.from &&
                                isAfter(date, selected.to)) {
                                var diff = differenceInCalendarDays(date, selected.from);
                                if (diff >= max) {
                                    return true;
                                }
                            }
                            if (min && selected.from && isBefore(date, selected.from)) {
                                var diff = differenceInCalendarDays(selected.from, date);
                                if (diff < min) {
                                    return true;
                                }
                            }
                            if (min &&
                                selected.to &&
                                selected.from &&
                                isAfter(date, selected.to)) {
                                var diff = differenceInCalendarDays(date, selected.from);
                                if (diff < min) {
                                    return true;
                                }
                            }
                            return false;
                        }
                    ];
                }
                modifiers.range_end = [selected.to];
            }
            else {
                modifiers.range_end = [selected.from];
            }
        }
    }
    return (React.createElement(SelectRangeContext.Provider, { value: { selected: selected, handleDayClick: handleDayClick, modifiers: modifiers } }, children));
}

/** Hook to access the [[SelectRangeContext]]. */
function useSelectRange() {
    var context = React.useContext(SelectRangeContext);
    if (!context) {
        throw new Error('useSelectRange must be used within a SelectRangeProvider');
    }
    return context;
}

/**
 * The SelectSingle context shares details about the selected days when in
 * single selection mode.
 *
 * Access this context from the [[useSelectSingle]] hook.
 */
var SelectSingleContext = React.createContext(undefined);

/** Provides the values for the [[SelectSingleProvider]]. */
function SelectSingleProvider(_a) {
    var initialProps = _a.initialProps, children = _a.children;
    var initialSelected;
    if (isDayPickerSingle(initialProps)) {
        initialSelected = initialProps.defaultSelected;
    }
    var _b = React.useState(initialSelected), selected = _b[0], setSelected = _b[1];
    var handleDayClick = function (day, dayModifiers, e) {
        var _a, _b;
        if (!isDayPickerSingle(initialProps))
            return;
        if (dayModifiers.selected && !initialProps.required) {
            setSelected(undefined);
            (_a = initialProps.onSelect) === null || _a === void 0 ? void 0 : _a.call(initialProps, undefined, day, dayModifiers, e);
            return;
        }
        setSelected(day);
        (_b = initialProps.onSelect) === null || _b === void 0 ? void 0 : _b.call(initialProps, day, day, dayModifiers, e);
    };
    var modifiers = { selected: [] };
    if (selected)
        modifiers.selected = [selected];
    return (React.createElement(SelectSingleContext.Provider, { value: { selected: selected, handleDayClick: handleDayClick, modifiers: modifiers } }, children));
}

/** Hook to access the [[SelectSingleContext]]. */
function useSelectSingle() {
    var context = React.useContext(SelectSingleContext);
    if (!context) {
        throw new Error('useSelectSingle must be used within a SelectSingleProvider');
    }
    return context;
}

/**
 * Build the `fromDate` and `toDate` values, given the fromMonth/toMonth
 * or fromYear/toYear props.
 */
function parseFromToProps(props) {
    var fromYear = props.fromYear, toYear = props.toYear, fromMonth = props.fromMonth, toMonth = props.toMonth;
    var fromDate = props.fromDate, toDate = props.toDate;
    if (fromMonth) {
        fromDate = startOfMonth(fromMonth);
    }
    else if (fromYear) {
        fromDate = new Date(fromYear, 0, 1);
    }
    if (toMonth) {
        toDate = startOfMonth(toMonth);
    }
    else if (toYear) {
        toDate = new Date(toYear, 11, 31);
    }
    return {
        fromDate: fromDate ? startOfDay(fromDate) : undefined,
        toDate: toDate ? startOfDay(toDate) : undefined
    };
}

/** Props that will merge into the modifiers. */
var modifierShortcuts = [
    'selected',
    'hidden',
    'disabled'
];
/**
 * Parse the modifiers from the props and return them as a map of array of
 * matcher.
 *
 * Internally we want modifiers as an array of matchers – as opposite of the
 * props which can accept also a matcher.
 */
function parseModifierProps(initialProps) {
    var initialModifiers = initialProps.modifiers || {};
    var modifiers = {
        selected: [],
        disabled: [],
        hidden: [],
        range_end: [],
        range_middle: [],
        range_start: []
    };
    Object.entries(initialModifiers).forEach(function (_a) {
        var modifier = _a[0], matcher = _a[1];
        if (Array.isArray(matcher)) {
            modifiers[modifier] = matcher;
        }
        else if (matcher) {
            modifiers[modifier] = [matcher];
        }
        else {
            modifiers[modifier] = [];
        }
    });
    modifierShortcuts.forEach(function (modifier) {
        if (Array.isArray(initialProps[modifier])) {
            modifiers[modifier] = initialProps[modifier];
        }
        else if (initialProps[modifier]) {
            modifiers[modifier] = [initialProps[modifier]];
        }
        else {
            modifiers[modifier] = [];
        }
    });
    return modifiers;
}

/** @private */
function isValidDate(day) {
    return !isNaN(day.getTime());
}

var DefaultFormat = 'PP';
/** Return props for binding an input field to DayPicker. */
function useInput(options) {
    if (options === void 0) { options = {}; }
    var _a = options.locale, locale = _a === void 0 ? enUS : _a, required = options.required, _b = options.format, format$1 = _b === void 0 ? DefaultFormat : _b, defaultSelected = options.defaultSelected, _c = options.today, today = _c === void 0 ? new Date() : _c;
    var _d = parseFromToProps(options), fromDate = _d.fromDate, toDate = _d.toDate;
    var min = required ? 1 : 0;
    // Shortcut to the DateFns functions
    var parseValue = function (value) { return parse(value, format$1, today, { locale: locale }); };
    // Initialize states
    var _e = React.useState(defaultSelected !== null && defaultSelected !== void 0 ? defaultSelected : today), month = _e[0], setMonth = _e[1];
    var _f = React.useState(defaultSelected), selectedDay = _f[0], setSelectedDay = _f[1];
    var defaultInputValue = defaultSelected
        ? format(defaultSelected, format$1, { locale: locale })
        : '';
    var _g = React.useState(defaultInputValue), inputValue = _g[0], setInputValue = _g[1];
    var reset = function () {
        setSelectedDay(defaultSelected);
        setMonth(defaultSelected !== null && defaultSelected !== void 0 ? defaultSelected : today);
        setInputValue(defaultInputValue !== null && defaultInputValue !== void 0 ? defaultInputValue : '');
    };
    var setSelected = function (date) {
        setSelectedDay(date);
        setMonth(date !== null && date !== void 0 ? date : today);
        setInputValue(date ? format(date, format$1, { locale: locale }) : '');
    };
    var handleDayClick = function (day, _a) {
        var selected = _a.selected;
        if (!required && selected) {
            setSelectedDay(undefined);
            setInputValue('');
            return;
        }
        setSelectedDay(day);
        setInputValue(day ? format(day, format$1, { locale: locale }) : '');
    };
    var handleMonthChange = function (month) {
        setMonth(month);
    };
    // When changing the input field, save its value in state and check if the
    // string is a valid date. If it is a valid day, set it as selected and update
    // the calendar’s month.
    var handleChange = function (e) {
        setInputValue(e.target.value);
        var day = parseValue(e.target.value);
        var isBefore = fromDate && differenceInCalendarDays(fromDate, day) > 0;
        var isAfter = toDate && differenceInCalendarDays(day, toDate) > 0;
        if (!isValidDate(day) || isBefore || isAfter) {
            setSelectedDay(undefined);
            return;
        }
        setSelectedDay(day);
        setMonth(day);
    };
    // Special case for _required_ fields: on blur, if the value of the input is not
    // a valid date, reset the calendar and the input value.
    var handleBlur = function (e) {
        var day = parseValue(e.target.value);
        if (!isValidDate(day)) {
            reset();
        }
    };
    // When focusing, make sure DayPicker visualizes the month of the date in the
    // input field.
    var handleFocus = function (e) {
        if (!e.target.value) {
            reset();
            return;
        }
        var day = parseValue(e.target.value);
        if (isValidDate(day)) {
            setMonth(day);
        }
    };
    var dayPickerProps = {
        mode: 'uncontrolled',
        month: month,
        onDayClick: handleDayClick,
        onMonthChange: handleMonthChange,
        selected: selectedDay,
        locale: locale,
        fromDate: options === null || options === void 0 ? void 0 : options.fromDate,
        toDate: options === null || options === void 0 ? void 0 : options.toDate,
        today: today,
        min: min
    };
    var fieldProps = {
        onBlur: handleBlur,
        onChange: handleChange,
        onFocus: handleFocus,
        value: inputValue
    };
    return { dayPickerProps: dayPickerProps, fieldProps: fieldProps, reset: reset, setSelected: setSelected };
}

/** Return `true` whether the given date is inside the range. */
function isDateInRange(date, range) {
    var _a;
    var from = range.from, to = range.to;
    if (!from) {
        return false;
    }
    if (!to && isSameDay(from, date)) {
        return true;
    }
    if (!to) {
        return false;
    }
    var isToBeforeFrom = differenceInCalendarDays(to, from) < 0;
    if (to && isToBeforeFrom) {
        _a = [to, from], from = _a[0], to = _a[1];
    }
    return (differenceInCalendarDays(date, from) >= 0 &&
        differenceInCalendarDays(to, date) >= 0);
}

/**
 * Returns `true` whether the day matches against the given matchers.
 */
function isMatch(day, matchers) {
    return matchers.some(function (matcher) {
        if (typeof matcher === 'boolean') {
            return matcher;
        }
        if (isDateType(matcher)) {
            return isSameDay(day, matcher);
        }
        if (isArrayOfDates(matcher)) {
            return matcher.includes(day);
        }
        if (isDateRange(matcher)) {
            return isDateInRange(day, matcher);
        }
        if (isDayOfWeekType(matcher)) {
            return matcher.dayOfWeek.includes(day.getDay());
        }
        if (isDateInterval(matcher)) {
            var isBefore = differenceInCalendarDays(matcher.before, day) > 0;
            var isAfter = differenceInCalendarDays(day, matcher.after) > 0;
            return isBefore && isAfter;
        }
        if (isDateAfterType(matcher)) {
            return differenceInCalendarDays(day, matcher.after) > 0;
        }
        if (isDateBeforeType(matcher)) {
            return differenceInCalendarDays(matcher.before, day) > 0;
        }
        if (typeof matcher === 'function') {
            return matcher(day);
        }
        return false;
    });
}

/**
 * Return the status of the modifiers that matches the given date.
 */
function getModifierStatus(date, 
/** The modifiers to match for the given date. */
modifiers) {
    var modifiersList = Object.keys(modifiers).reduce(function (previousValue, key) {
        var modifier = modifiers[key];
        if (isMatch(date, modifier)) {
            previousValue.push(key);
        }
        return previousValue;
    }, []);
    var modifiersStatus = {};
    modifiersList.forEach(function (modifier) { return (modifiersStatus[modifier] = true); });
    return modifiersStatus;
}

/** Return the modifiers and its styles for the specified date. */
function useModifiers(date) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var context = useDayPicker();
    var singleSelect = useSelectSingle();
    var multipleSelect = useSelectMultiple();
    var rangeSelect = useSelectRange();
    // TODO: modifiers from context should not be overridden
    var modifiers = __assign(__assign({}, context.modifiers), { today: (_a = context.modifiers.today) !== null && _a !== void 0 ? _a : [context.today], disabled: context.modifiers.disabled });
    if (isDayPickerSingle(context)) {
        modifiers.selected = modifiers.selected.concat((_b = singleSelect.modifiers.selected) !== null && _b !== void 0 ? _b : []);
    }
    else if (isDayPickerMultiple(context)) {
        modifiers.selected = modifiers.selected.concat((_c = multipleSelect.modifiers.selected) !== null && _c !== void 0 ? _c : []);
        modifiers.disabled = modifiers.disabled.concat((_d = multipleSelect.modifiers.disabled) !== null && _d !== void 0 ? _d : []);
    }
    else if (isDayPickerRange(context)) {
        modifiers.selected = modifiers.selected.concat((_e = multipleSelect.modifiers.selected) !== null && _e !== void 0 ? _e : []);
        modifiers.disabled = modifiers.disabled.concat((_f = multipleSelect.modifiers.disabled) !== null && _f !== void 0 ? _f : []);
        modifiers.range_start = (_g = rangeSelect.modifiers.range_start) !== null && _g !== void 0 ? _g : [];
        modifiers.range_middle = (_h = rangeSelect.modifiers.range_middle) !== null && _h !== void 0 ? _h : [];
        modifiers.range_end = (_j = rangeSelect.modifiers.range_end) !== null && _j !== void 0 ? _j : [];
        modifiers.disabled = modifiers.disabled.concat((_k = rangeSelect.modifiers.disabled) !== null && _k !== void 0 ? _k : []);
    }
    var status = getModifierStatus(date, modifiers);
    var modifierClassNames = [];
    Object.keys(status)
        .filter(function (modifier) { return Boolean(status[modifier]); })
        .forEach(function (modifier) {
        var customClassName = context.modifierClassNames[modifier];
        if (customClassName) {
            modifierClassNames.push(customClassName);
        }
        else {
            modifierClassNames.push("" + context.modifierPrefix + modifier);
        }
    });
    var modifierStyle = {};
    if (context.modifierStyles) {
        Object.keys(status).forEach(function (modifier) {
            var _a;
            modifierStyle = __assign(__assign({}, modifierStyle), (_a = context.modifierStyles) === null || _a === void 0 ? void 0 : _a[modifier]);
        });
    }
    return {
        modifiers: status,
        modifierClassNames: modifierClassNames,
        modifierStyle: modifierStyle
    };
}

/**
 * The Focus context shares details about the focused day for the keyboard navigation.
 *
 * Access this context from the [[useFocus]] hook.
 */
var FocusContext = React.createContext(undefined);

/** The provider for the [[FocusContext]]. */
function FocusProvider(_a) {
    var children = _a.children;
    var _b = React.useState(), focusedDay = _b[0], setDay = _b[1];
    var _c = useNavigation(), goToMonth = _c.goToMonth, displayMonths = _c.displayMonths;
    var numberOfMonths = useDayPicker().numberOfMonths;
    var blur = function () { return setDay(undefined); };
    var focus = function (date) { return setDay(date); };
    var switchMonth = function (date, offset) {
        if (displayMonths.some(function (m) { return isSameMonth(date, m); }))
            return;
        if (offset < 0) {
            goToMonth(addMonths(date, 1 + offset));
        }
        else {
            goToMonth(date);
        }
    };
    var focusDayBefore = function () {
        if (!focusedDay)
            return;
        var before = addDays(focusedDay, -1);
        setDay(before);
        switchMonth(before, numberOfMonths * -1);
    };
    var focusDayAfter = function () {
        if (!focusedDay)
            return;
        var after = addDays(focusedDay, 1);
        setDay(after);
        switchMonth(after, numberOfMonths);
    };
    var focusWeekBeforeDay = function () {
        if (!focusedDay)
            return;
        var up = addWeeks(focusedDay, -1);
        setDay(up);
        switchMonth(up, numberOfMonths * -1);
    };
    var focusWeekAfterDay = function () {
        if (!focusedDay)
            return;
        var down = addWeeks(focusedDay, 1);
        setDay(down);
        switchMonth(down, numberOfMonths);
    };
    var setters = {
        blur: blur,
        focus: focus,
        focusDayAfter: focusDayAfter,
        focusDayBefore: focusDayBefore,
        focusWeekAfterDay: focusWeekAfterDay,
        focusWeekBeforeDay: focusWeekBeforeDay
    };
    return (React.createElement(FocusContext.Provider, { value: [focusedDay, setters] }, children));
}

/** Hook to access the [[FocusContext]]. */
function useFocus() {
    var context = React.useContext(FocusContext);
    if (!context) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
}

/** Handle the focus for the day element. */
function useDayFocus(date, buttonRef) {
    var _a = useFocus(), focusedDay = _a[0], _b = _a[1], focusDayAfter = _b.focusDayAfter, focusDayBefore = _b.focusDayBefore, focusWeekAfterDay = _b.focusWeekAfterDay, focusWeekBeforeDay = _b.focusWeekBeforeDay, blur = _b.blur, focus = _b.focus;
    // Focus the HTML element if this is the focused day.
    React.useEffect(function () {
        var _a;
        if (!focusedDay)
            return;
        if (isSameDay(focusedDay, date)) {
            (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    }, [focusedDay]);
    var focusOnKeyDown = function (e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                e.stopPropagation();
                focusDayBefore();
                break;
            case 'ArrowRight':
                e.preventDefault();
                e.stopPropagation();
                focusDayAfter();
                break;
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                focusWeekAfterDay();
                break;
            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                focusWeekBeforeDay();
                break;
        }
    };
    var isFocused = Boolean(focusedDay && !isSameDay(focusedDay, date));
    return { focus: focus, blur: blur, focusOnKeyDown: focusOnKeyDown, isFocused: isFocused };
}

/**
 * This hook returns details about the content to render in the day cell.
 *
 *
 * When a day cell is rendered in the table, DayPicker can either:
 *
 * - render nothing: when the day is outside the month or has matched the
 *   "hidden" modifier.
 * - render a button. When a selection mode is set, DayPicker renders a button
 *   to allow the focus and the selection. In case of `uncontrolled` selection
 *   mode, DayPicker expects a `onDayClick` prop to render a button.
 * - render a non-interactive element: when no selection mode is set, the day
 *   cell shouldn’t respond to any interaction. DayPicker should render a `div`
 *   or a `span`.
 *
 * ### Usage
 *
 * Use this hook to customize the behavior of the [[Day]] component. Create a
 * new `Day` component using this hook and pass it to the `components` prop.
 * The source of [[Day]] can be a good starting point.
 *
 * */
function useDay(
/** The day rendered in the month. */
date, 
/** The month where the date is displayed. DayPicker renders days outside the display month when `showOutsideDays` is true. */
displayMonth, 
/** A ref to the button element. */
buttonRef) {
    var context = useDayPicker();
    var single = useSelectSingle();
    var multiple = useSelectMultiple();
    var range = useSelectRange();
    var _a = useDayFocus(date, buttonRef), focus = _a.focus, blur = _a.blur, focusOnKeyDown = _a.focusOnKeyDown, isFocused = _a.isFocused;
    var _b = useModifiers(date), modifiers = _b.modifiers, modifierClassNames = _b.modifierClassNames, modifierStyle = _b.modifierStyle;
    var isOutside = !isSameMonth(date, displayMonth);
    var returnValue = {
        isOutside: true,
        modifiers: modifiers,
        selected: isDayPickerSingle(context)
            ? single.selected
            : isDayPickerMultiple(context)
                ? multiple.selected
                : isDayPickerRange(context)
                    ? range.selected
                    : undefined,
        single: single,
        multiple: multiple,
        range: range
    };
    if (isOutside && !context.showOutsideDays) {
        return returnValue;
    }
    if (modifiers.hidden) {
        return returnValue;
    }
    var classNames = [context.classNames.day].concat(modifierClassNames);
    var style = __assign(__assign({}, context.styles.day), modifierStyle);
    if (isOutside) {
        classNames.push(context.classNames.day_outside);
        style = __assign(__assign({}, context.styles), context.styles.day_outside);
    }
    var DayContent = context.components.DayContent;
    var children = (React__default.createElement(DayContent, { date: date, displayMonth: displayMonth, modifiers: modifiers }));
    var className = classNames.join(' ');
    if (!context.mode) {
        return __assign(__assign({}, returnValue), { nonInteractiveProps: {
                style: style,
                className: className,
                children: children
            } });
    }
    // #region Event handlers
    var handleClick = function (e) {
        var _a, _b, _c, _d;
        if (isDayPickerSingle(context)) {
            (_a = single.handleDayClick) === null || _a === void 0 ? void 0 : _a.call(single, date, modifiers, e);
        }
        else if (isDayPickerMultiple(context)) {
            (_b = multiple.handleDayClick) === null || _b === void 0 ? void 0 : _b.call(multiple, date, modifiers, e);
        }
        else if (isDayPickerRange(context)) {
            (_c = range.handleDayClick) === null || _c === void 0 ? void 0 : _c.call(range, date, modifiers, e);
        }
        (_d = context.onDayClick) === null || _d === void 0 ? void 0 : _d.call(context, date, modifiers, e);
    };
    var handleFocus = function (e) {
        var _a;
        focus(date);
        (_a = context.onDayFocus) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleBlur = function (e) {
        var _a;
        blur();
        (_a = context.onDayBlur) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleKeyDown = function (e) {
        var _a;
        focusOnKeyDown(e);
        (_a = context.onDayKeyDown) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleKeyUp = function (e) {
        var _a;
        (_a = context.onDayKeyUp) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleMouseEnter = function (e) {
        var _a;
        (_a = context.onDayMouseEnter) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleMouseLeave = function (e) {
        var _a;
        (_a = context.onDayMouseLeave) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleTouchCancel = function (e) {
        var _a;
        (_a = context.onDayTouchCancel) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleTouchEnd = function (e) {
        var _a;
        (_a = context.onDayTouchEnd) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleTouchMove = function (e) {
        var _a;
        (_a = context.onDayTouchMove) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    var handleTouchStart = function (e) {
        var _a;
        (_a = context.onDayTouchStart) === null || _a === void 0 ? void 0 : _a.call(context, date, modifiers, e);
    };
    if (isOutside) {
        classNames.push(context.classNames.day_outside);
        style = __assign(__assign({}, context.styles), context.styles.day_outside);
    }
    className = classNames.join(' ');
    var selected = modifiers.selected, disabled = modifiers.disabled;
    var tabIndex = disabled || isFocused ? -1 : 0;
    return __assign(__assign({}, returnValue), { buttonProps: {
            children: children,
            'aria-pressed': selected,
            style: style,
            disabled: disabled,
            className: className,
            tabIndex: tabIndex,
            onClick: handleClick,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onKeyDown: handleKeyDown,
            onKeyUp: handleKeyUp,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onTouchCancel: handleTouchCancel,
            onTouchEnd: handleTouchEnd,
            onTouchMove: handleTouchMove,
            onTouchStart: handleTouchStart
        } });
}

/**
 * The content of a day cell – as a button or span element according to its
 * modifiers.
 */
function Day(props) {
    var buttonRef = React.useRef(null);
    var day = useDay(props.date, props.displayMonth, buttonRef);
    var buttonProps = day.buttonProps, nonInteractiveProps = day.nonInteractiveProps;
    if (!buttonProps && !nonInteractiveProps) {
        return React.createElement(React.Fragment, null);
    }
    if (nonInteractiveProps) {
        return React.createElement("div", __assign({}, nonInteractiveProps));
    }
    return React.createElement(Button, __assign({ ref: buttonRef }, buttonProps));
}

/**
 * Render the content of the day cell.
 */
function DayContent(props) {
    var _a = useDayPicker(), locale = _a.locale, classNames = _a.classNames, styles = _a.styles, labelDay = _a.labels.labelDay, formatDay = _a.formatters.formatDay;
    return (React.createElement(React.Fragment, null,
        React.createElement("span", { "aria-hidden": "true" }, formatDay(props.date, { locale: locale })),
        React.createElement("span", { className: classNames.vhidden, style: styles.vhidden }, labelDay(props.date, props.modifiers, { locale: locale }))));
}

/**
 * Render a styled select component – displaying a caption and a custom
 * drop-down icon.
 */
function Dropdown(props) {
    var onChange = props.onChange, value = props.value, children = props.children, caption = props.caption, className = props.className, style = props.style;
    var _a = useDayPicker(), classNames = _a.classNames, styles = _a.styles, IconDropdown = _a.components.IconDropdown;
    return (React.createElement("div", { className: className, style: style },
        React.createElement("span", { className: classNames.vhidden }, props['aria-label']),
        React.createElement("select", { "aria-label": props['aria-label'], className: classNames.dropdown, style: styles.dropdown, value: value, onChange: onChange }, children),
        React.createElement("div", { className: classNames.caption_label, style: styles.caption_label, "aria-hidden": "true" },
            caption,
            React.createElement(IconDropdown, { className: classNames.dropdown_icon, style: styles.dropdown_icon }))));
}

/** Render the Footer component (empty as default).*/
function Footer() {
    var _a = useDayPicker(), footer = _a.footer, styles = _a.styles, tfoot = _a.classNames.tfoot;
    if (!footer)
        return React.createElement(React.Fragment, null);
    return (React.createElement("tfoot", { className: tfoot, style: styles.tfoot },
        React.createElement("tr", null,
            React.createElement("td", { colSpan: 8 }, footer))));
}

/**
 * Render the icon in the styled drop-down.
 */
function IconDropdown(props) {
    return (React.createElement("svg", __assign({ width: "8px", height: "8px", viewBox: "0 0 120 120", "data-testid": "iconDropdown" }, props),
        React.createElement("path", { d: "M4.22182541,48.2218254 C8.44222828,44.0014225 15.2388494,43.9273804 19.5496459,47.9996989 L19.7781746,48.2218254 L60,88.443 L100.221825,48.2218254 C104.442228,44.0014225 111.238849,43.9273804 115.549646,47.9996989 L115.778175,48.2218254 C119.998577,52.4422283 120.07262,59.2388494 116.000301,63.5496459 L115.778175,63.7781746 L67.7781746,111.778175 C63.5577717,115.998577 56.7611506,116.07262 52.4503541,112.000301 L52.2218254,111.778175 L4.22182541,63.7781746 C-0.0739418023,59.4824074 -0.0739418023,52.5175926 4.22182541,48.2218254 Z", fill: "currentColor", fillRule: "nonzero" })));
}

/**
 * Render the "next month" button in the navigation.
 */
function IconNext(props) {
    return (React.createElement("svg", __assign({ width: "16px", height: "16px", viewBox: "0 0 120 120" }, props, { "data-testid": "iconNext" }),
        React.createElement("path", { d: "M49.8040405,3.34314575 C46.6798462,0.218951416 41.6145263,0.218951416 38.490332,3.34314575 C35.4326099,6.40086786 35.367552,11.3179931 38.2951583,14.4548388 L38.490332,14.6568542 L83.8333725,60 L38.490332,105.343146 C35.4326099,108.400868 35.367552,113.317993 38.2951583,116.454839 L38.490332,116.656854 C41.5480541,119.714576 46.4651794,119.779634 49.602025,116.852028 L49.8040405,116.656854 L100.804041,65.6568542 C103.861763,62.5991321 103.926821,57.6820069 100.999214,54.5451612 L100.804041,54.3431458 L49.8040405,3.34314575 Z", fill: "currentColor" })));
}

/**
 * Render the "previous month" button in the navigation.
 */
function IconPrevious(props) {
    return (React.createElement("svg", __assign({ width: "16px", height: "16px", viewBox: "0 0 120 120", "data-testid": "iconPrevious" }, props),
        React.createElement("path", { d: "M69.490332,3.34314575 C72.6145263,0.218951416 77.6798462,0.218951416 80.8040405,3.34314575 C83.8617626,6.40086786 83.9268205,11.3179931 80.9992143,14.4548388 L80.8040405,14.6568542 L35.461,60 L80.8040405,105.343146 C83.8617626,108.400868 83.9268205,113.317993 80.9992143,116.454839 L80.8040405,116.656854 C77.7463184,119.714576 72.8291931,119.779634 69.6923475,116.852028 L69.490332,116.656854 L18.490332,65.6568542 C15.4326099,62.5991321 15.367552,57.6820069 18.2951583,54.5451612 L18.490332,54.3431458 L69.490332,3.34314575 Z", fill: "currentColor", fillRule: "nonzero" })));
}

/**
 * Render a row in the calendar, with the days and optionally the week number.
 */
function Row(props) {
    var _a = useDayPicker(), styles = _a.styles, classNames = _a.classNames, showWeekNumber = _a.showWeekNumber, _b = _a.components, Day = _b.Day, WeekNumber = _b.WeekNumber;
    var weekNumberCell;
    if (showWeekNumber) {
        weekNumberCell = (React.createElement("td", { className: classNames.cell, style: styles.cell },
            React.createElement(WeekNumber, { number: props.weekNumber, dates: props.dates })));
    }
    return (React.createElement("tr", { className: classNames.row, style: styles.row },
        weekNumberCell,
        props.dates.map(function (date) { return (React.createElement("td", { className: classNames.cell, style: styles.cell, key: getUnixTime(date) },
            React.createElement(Day, { displayMonth: props.displayMonth, date: date }))); })));
}

/**
 * Render the week number element. If `onWeekNumberClick` is passed to DayPicker, it
 * renders a button, otherwise a span element.
 */
function WeekNumber(props) {
    var weekNumber = props.number, dates = props.dates;
    var _a = useDayPicker(), onWeekNumberClick = _a.onWeekNumberClick, onWeekNumberMouseEnter = _a.onWeekNumberMouseEnter, onWeekNumberMouseLeave = _a.onWeekNumberMouseLeave, styles = _a.styles, classNames = _a.classNames, locale = _a.locale, labelWeekNumber = _a.labels.labelWeekNumber, formatWeekNumber = _a.formatters.formatWeekNumber;
    var handleClick = function (e) {
        onWeekNumberClick === null || onWeekNumberClick === void 0 ? void 0 : onWeekNumberClick(weekNumber, dates, e);
    };
    var handleMouseEnter = function (e) {
        onWeekNumberMouseEnter === null || onWeekNumberMouseEnter === void 0 ? void 0 : onWeekNumberMouseEnter(weekNumber, dates, e);
    };
    var handleMouseLeave = function (e) {
        onWeekNumberMouseLeave === null || onWeekNumberMouseLeave === void 0 ? void 0 : onWeekNumberMouseLeave(weekNumber, dates, e);
    };
    var content = formatWeekNumber(Number(weekNumber), { locale: locale });
    if (!onWeekNumberClick) {
        return (React.createElement("span", { className: classNames.weeknumber, style: styles.weeknumber }, content));
    }
    var label = labelWeekNumber(Number(weekNumber), { locale: locale });
    return (React.createElement(Button, { "aria-label": label, className: classNames.weeknumber, style: styles.weeknumber, onClick: handleClick, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }, content));
}

/**
 * The name of the default CSS classes.
 */
var defaultClassNames = {
    root: 'rdp',
    multiple_month: 'rdp-multiple_months',
    with_weeknumber: 'rdp-with_weeknumber',
    vhidden: 'rdp-vhidden',
    button_reset: 'rdp-button_reset',
    button: 'rdp-button',
    caption: 'rdp-caption',
    caption_first: 'rdp-caption_first',
    caption_last: 'rdp-caption_last',
    caption_middle: 'rdp-caption_middle',
    caption_label: 'rdp-caption_label',
    caption_dropdowns: 'rdp-caption_dropdowns',
    dropdown: 'rdp-dropdown',
    dropdown_month: 'rdp-dropdown_month',
    dropdown_year: 'rdp-dropdown_year',
    dropdown_icon: 'rdp-dropdown_icon',
    months: 'rdp-months',
    month: 'rdp-month',
    table: 'rdp-table',
    tbody: 'rdp-tbody',
    tfoot: 'rdp-tfoot',
    head: 'rdp-head',
    head_row: 'rdp-head_row',
    head_cell: 'rdp-head_cell',
    nav: 'rdp-nav',
    nav_button: 'rdp-nav_button',
    nav_button_previous: 'rdp-nav_button_previous',
    nav_button_next: 'rdp-nav_button_next',
    nav_icon: 'rdp-nav_icon',
    row: 'rdp-row',
    row_head: 'rdp-row_head',
    weeknumber: 'rdp-weeknumber',
    cell: 'rdp-cell',
    day: 'rdp-day',
    day_outside: 'rdp-day_outside',
    day_today: 'rdp-day_today'
};

/**
 * The default formatter for the caption.
 */
function formatCaption(month, options) {
    return format(month, 'LLLL y', options);
}

/**
 * The default formatter for the Day button.
 */
function formatDay(day, options) {
    return format(day, 'd', options);
}

/**
 * The default formatter for the Month caption.
 */
function formatMonthCaption(month, options) {
    return format(month, 'LLLL', options);
}

/**
 * The default formatter for the week number.
 */
function formatWeekNumber(weekNumber) {
    return "" + weekNumber;
}

/**
 * The default formatter for the name of the weekday.
 */
function formatWeekdayName(weekday, options) {
    return format(weekday, 'cccccc', options);
}

/**
 * The default formatter for the Year caption.
 */
function formatYearCaption(year, options) {
    return format(year, 'yyyy', options);
}

var formatters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    formatCaption: formatCaption,
    formatDay: formatDay,
    formatMonthCaption: formatMonthCaption,
    formatWeekNumber: formatWeekNumber,
    formatWeekdayName: formatWeekdayName,
    formatYearCaption: formatYearCaption
});

/**
 * The default ARIA label for the day button.
 */
var labelDay = function (day, options) {
    return format(day, 'do MMMM (EEEE)', options);
};

/**
 * The default ARIA label for the WeekNumber element.
 */
var labelMonthDropdown = function () {
    return 'Month: ';
};

/**
 * The default ARIA label for next month button in navigation
 */
var labelNext = function () {
    return 'Go to next month';
};

/**
 * The default ARIA label for previous month button in navigation
 */
var labelPrevious = function () {
    return 'Go to previous month';
};

/**
 * The default ARIA label for the Weekday element.
 */
var labelWeekday = function (day, options) {
    return format(day, 'cccc.', options);
};

/**
 * The default ARIA label for the WeekNumber element.
 */
var labelWeekNumber = function (n) {
    return "Week n. " + n;
};

/**
 * The default ARIA label for the WeekNumber element.
 */
var labelYearDropdown = function () {
    return 'Year: ';
};

var labels = /*#__PURE__*/Object.freeze({
    __proto__: null,
    labelDay: labelDay,
    labelMonthDropdown: labelMonthDropdown,
    labelNext: labelNext,
    labelPrevious: labelPrevious,
    labelWeekday: labelWeekday,
    labelWeekNumber: labelWeekNumber,
    labelYearDropdown: labelYearDropdown
});

/**
 * The provider for the [[DayPickerContext]].
 */
function DayPickerProvider(props) {
    var _a, _b, _c, _d, _e, _f;
    var children = props.children, initialProps = props.initialProps;
    var locale = (_a = initialProps.locale) !== null && _a !== void 0 ? _a : enUS;
    var numberOfMonths = (_b = initialProps.numberOfMonths) !== null && _b !== void 0 ? _b : 1;
    var today = (_c = initialProps.today) !== null && _c !== void 0 ? _c : new Date();
    // Limit navigation
    var _g = parseFromToProps(initialProps), fromDate = _g.fromDate, toDate = _g.toDate;
    // Default caption layout. If calendar navigation is unlimited, it must be
    // always `buttons` – as we cannot display infinite options in the dropdown.
    var captionLayout = (_d = initialProps.captionLayout) !== null && _d !== void 0 ? _d : 'buttons';
    if (!fromDate && !toDate)
        captionLayout = 'buttons';
    var modifiers = parseModifierProps(initialProps);
    // Disable days before/after from/toDate
    if (fromDate) {
        modifiers.disabled.push({ before: fromDate });
    }
    if (toDate) {
        modifiers.disabled.push({ after: toDate });
    }
    initialProps.toYear; initialProps.fromYear; initialProps.toMonth; initialProps.fromMonth; var contextProps = __rest(initialProps, ["toYear", "fromYear", "toMonth", "fromMonth"]);
    var context = __assign(__assign({}, contextProps), { captionLayout: captionLayout,
        fromDate: fromDate,
        toDate: toDate,
        today: today,
        locale: locale, modifierClassNames: (_e = initialProps.modifierClassNames) !== null && _e !== void 0 ? _e : {}, modifierPrefix: 'rdp-day_', modifiers: modifiers, numberOfMonths: numberOfMonths, styles: (_f = initialProps.styles) !== null && _f !== void 0 ? _f : {}, classNames: __assign(__assign({}, defaultClassNames), initialProps.classNames), formatters: __assign(__assign({}, formatters), initialProps.formatters), labels: __assign(__assign({}, labels), initialProps.labels), components: __assign({ Caption: Caption, CaptionLabel: CaptionLabel, Day: Day, DayContent: DayContent, Dropdown: Dropdown, Footer: Footer, Head: Head, IconDropdown: IconDropdown, IconNext: IconNext, IconPrevious: IconPrevious, Row: Row, WeekNumber: WeekNumber }, initialProps.components) });
    return (React.createElement(DayPickerContext.Provider, { value: context }, children));
}

/** Provide the value for all the context providers. */
function ContextProvider(props) {
    var children = props.children, initialProps = __rest(props, ["children"]);
    return (React.createElement(DayPickerProvider, { initialProps: initialProps },
        React.createElement(NavigationProvider, null,
            React.createElement(SelectSingleProvider, { initialProps: initialProps },
                React.createElement(SelectMultipleProvider, { initialProps: initialProps },
                    React.createElement(SelectRangeProvider, { initialProps: initialProps },
                        React.createElement(FocusProvider, null, children)))))));
}

/**
 * DayPicker render a date picker component to let users pick dates from a
 * calendar. See http://react-day-picker.js.org for updated documentation and
 * examples.
 *
 * ### Customization
 *
 * DayPicker offers different customization props. For example,
 *
 * - show multiple months using `numberOfMonths`
 * - display a dropdown to navigate the months via `captionLayout`
 * - display the week numbers with `showWeekNumbers`
 * - disable or hide days with `disabled` or `hidden`
 *
 * ### Controlling the months
 *
 * Change the initially displayed month using the `defaultMonth` prop. The
 * displayed months are controlled by DayPicker and stored in its internal
 * state. To control the months yourself, use `month` instead of `defaultMonth`
 * and use the `onMonthChange` event to set it.
 *
 * To limit the months the user can navigate to, use
 * `fromDate`/`fromMonth`/`fromYear` or `toDate`/`toMonth`/`toYear`.
 *
 * ### Selection modes
 *
 * DayPicker supports different selection mode that can be toggled using the
 * `mode` prop:
 *
 * - `mode="single"`: only one day can be selected. Use `required` to make the
 *   selection required. Use the `onSelect` event handler to get the selected
 *   days.
 * - `mode="multiple"`: users can select one or more days. Limit the amount of
 *   days that can be selected with the `min` or the `max` props.
 * - `mode="range"`: users can select a range of days. Limit the amount of days
 *   in the range with the `min` or the `max` props.
 *
 * These selection modes should cover the most common use cases. In case you
 * need a more refined way of selecting days, use `mode="uncontrolled"`. Use the
 * `selected` props and add the day event handlers to add/remove days from the
 * selection.
 *
 * ### Modifiers
 *
 * A _modifier_ represents different styles or states for the days displayed in
 * the calendar (like "selected" or "disabled"). Define custom modifiers using
 * the `modifiers` prop.
 *
 * ### Formatters and custom component
 *
 * You can customize how the content is displayed in the date picker by using
 * either the formatters or replacing the internal components.
 *
 * For the most common cases you want to use the `formatters` prop to change how
 * the content is formatted in the calendar. Use the `components` prop to
 * replace the internal components, like the navigation icons.
 *
 * ### Styling
 *
 * DayPicker comes with a default, basic style in `react-day-picker/style` –
 * use it as template for your own style.
 *
 * If you are using CSS modules, pass the imported styles object the
 * `classNames` props.
 *
 * You can also style the elements via inline-styles using the `styles` prop.
 *
 * ### Form fields
 *
 * If you need to bind the date picker to a form field, you can use the
 * `useInput` hooks for a basic behavior. See the `useInput` source as an
 * example to bind the date picker with form fields.
 *
 * ### Localization
 *
 * To localize DayPicker, import the locale from `date-fns` package and use the
 * `locale` prop.
 *
 * For example, to use Spanish locale:
 *
 * ```
 * import es from 'date-fns/locale/es';
 * <DayPicker locale={es} />
 * ```
 */
function DayPicker(props) {
    return (React.createElement(ContextProvider, __assign({}, props),
        React.createElement(Root, null)));
}

export { Button, Caption, CaptionLabel, ContextProvider, Day, DayContent, DayPicker, Dropdown, FocusContext, FocusProvider, Footer, Head, IconDropdown, IconNext, IconPrevious, MonthsDropdown, Navigation, NavigationContext, NavigationProvider, Root, Row, SelectMultipleContext, SelectMultipleProvider, SelectRangeContext, SelectRangeProvider, SelectSingleContext, SelectSingleProvider, Table, WeekNumber, YearsDropdown, isArrayOfDates, isDateAfterType, isDateBeforeType, isDateInterval, isDateRange, isDateType, isDayOfWeekType, isDayPickerMultiple, isDayPickerRange, isDayPickerSingle, isDayPickerUncontrolled, useDay, useDayPicker, useFocus, useInput, useModifiers, useNavigation, useSelectMultiple, useSelectRange, useSelectSingle };
//# sourceMappingURL=index.esm.js.map
