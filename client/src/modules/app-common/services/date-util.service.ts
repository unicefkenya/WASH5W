import { Injectable } from '@angular/core';
import { TimestepEnum } from '@modules/timesteps/models/timestep.enum';
import moment from 'moment';

/**
 * A utility service for handling Date objects and date-related tasks.
 */
@Injectable({ providedIn: 'root' })
export class DateUtilService {

    /**
     * Returns a numeric timepoint ID from a given Date object.
     * @param date The Date object to generate the timepoint ID from.
     * @returns A numeric timepoint ID generated from the year, month, and day of the input Date object.
     */
    public getTimePointIdFromDate(date: Date): number {
        let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
        let month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
        let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

        return parseInt(`${year}${month}${day}`);
    }

    /**
     * Returns a formatted date string from a given timepoint ID.
     * @param timepointId The timepoint ID to generate the date string from.
     * @returns A formatted date string in the format "YYYY-MM-DD", or null if the input is null or undefined.
     */
    public getDateStringFromTimepointId(timepointId: number | null | undefined): string | null {
        if (timepointId) {
            let yearString = timepointId.toString();
            let output = [];

            for (var i = 0, len = yearString.length; i < len; i++) {
                output.push(yearString.charAt(i));
            }

            return output[0] + "" + output[1] + "" + output[2] + "" + output[3] + "-" + output[4] + "" + output[5] + "-" + output[6] + "" + output[7];
        } else {
            return null;
        }
    }

    /**
     * Returns a Date object from a given date string.
     * @param dateString The date string to generate the Date object from.
     * @returns A Date object generated from the input date string, or null if the input is null.
     */
    public getDateFromDateString(dateString: string | null): Date | null {
        if (dateString) {
            return new Date(dateString);
        } else {
            return null;
        }
    }


    /**
     * A utility function for formatting a date string in a specified format.
     * @param d The date string to format, in ISO 8601 format.
     * @param format The date format to use: 'short', 'medium', or 'long'.
     * @returns A formatted date string in the specified format.
     */
    public formatDate(d: string | Date | null | undefined, format: 'short' | 'medium' | 'long'): string {

        // Check if the date was provided
        if (d) {

            // The date was provided
            let date: Date = (typeof d === 'string') ? new Date(d) : d;

            // Format the date components using the Intl.DateTimeFormat API.
            let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
            let month = '';
            let day = '';
            let suffix = '';
            let weekday = '';

            switch (format) {

                case 'short':
                    month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
                    day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
                    return `${year}-${month}-${day}`;

                case 'medium':
                    month = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
                    day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date);
                    suffix = '';
                    if (day === '1' || day === '21' || day === '31') {
                        suffix = 'st';
                    } else if (day === '2' || day === '22') {
                        suffix = 'nd';
                    } else if (day === '3' || day === '23') {
                        suffix = 'rd';
                    } else {
                        suffix = 'th';
                    }
                    return `${month} ${day}${suffix} ${year}`;

                case 'long':
                    weekday = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date);
                    month = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
                    day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date);
                    suffix = '';
                    if (day === '1' || day === '21' || day === '31') {
                        suffix = 'st';
                    } else if (day === '2' || day === '22') {
                        suffix = 'nd';
                    } else if (day === '3' || day === '23') {
                        suffix = 'rd';
                    } else {
                        suffix = 'th';
                    }
                    return `${weekday} ${month} ${day}${suffix} ${year}`;

                default:
                    throw new Error(`Invalid date format: ${format}`);
            }
        } else {

            // The date string was not provided
            throw new Error(`Date string not provided`);
        }


    }



    public getIntervalDescriptor(startDateString: string | null | undefined, endDateString: string | null | undefined, timestep: TimestepEnum, year: 'calendar' | 'fiscal'): string {

        // Check if the date strings were provided
        if (startDateString && endDateString) {

            // The date string was provided

            switch (timestep) {
                case TimestepEnum.DAILY:
                    return this.getDailyDescriptor(startDateString, endDateString);
                case TimestepEnum.WEEKLY:
                    return this.getWeeklyDescriptor(startDateString, endDateString, year);
                case TimestepEnum.BI_WEEKLY:
                    return this.getBiweeklyDescriptor(startDateString, endDateString, year);
                case TimestepEnum.MONTHLY:
                    return this.getMonthlyDescriptor(startDateString, endDateString);
                case TimestepEnum.QUARTERLY:
                    return this.getQuarterlyDescriptor(startDateString, endDateString, year);
                case TimestepEnum.SEMIANNUALLY:
                    return this.getSemiannualDescriptor(startDateString, endDateString, year);
                case TimestepEnum.ANNUALLY:
                    return this.getAnnualDescriptor(startDateString, endDateString, year);
                case TimestepEnum.BIENNIALLY:
                    return this.getBiennialDescriptor(startDateString, endDateString, year);
                default:
                    throw new Error(`Invalid date period: ${timestep}`);
            }
        } else {

            // Date strings were not both provided
            throw new Error(`Date strings were not both provide`);
        }


    }

    public getNow(): string {

        let date: Date = new Date();

        // Format the date components using the Intl.DateTimeFormat API.
        let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
        let month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
        let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

        return `${year}-${month}-${day}`;

    }


    public getCurrent(dateString: string | null | undefined, period: TimestepEnum, year: 'calendar' | 'fiscal'): { start: string; end: string } {
        if (year === 'fiscal') {
            return this.getCurrentFiscal(dateString, period);
        } else {
            return this.getCurrentCalendar(dateString, period);
        }
    }

    public getCurrentCalendar(dateString: string | null | undefined, period: TimestepEnum): { start: string; end: string } {
        // Check if the date string was provided
        if (dateString) {
            // Get the date from the date string
            const date = moment(dateString, 'YYYY-MM-DD');

            if (period === TimestepEnum.DAILY) {
                return { start: date.format('YYYY-MM-DD'), end: date.format('YYYY-MM-DD') };
            } else {
                // Extract the year and month from the date string
                const year = moment(dateString, 'YYYY-MM-DD').year();
                const month = moment(dateString, 'YYYY-MM-DD').month();

                let curEnd!: moment.Moment;
                let curStart!: moment.Moment;

                switch (period) {
                    case TimestepEnum.WEEKLY:
                        curStart = moment(date).startOf('week');
                        curEnd = moment(date).endOf('week');
                        break;

                    case TimestepEnum.BI_WEEKLY:
                        curStart = moment(date).startOf('week');
                        curEnd = moment(date).add(1, 'week').endOf('week');
                        break;

                    case TimestepEnum.MONTHLY:
                        curStart = moment(date).startOf('month');
                        curEnd = moment(date).endOf('month');
                        break;

                    case TimestepEnum.QUARTERLY:
                        const quarter = Math.floor(month / 3) + 1;
                        curStart = moment(date).startOf('year').add(quarter - 1, 'quarter');
                        curEnd = moment(date).startOf('year').add(quarter, 'quarter').subtract(1, 'day');
                        break;

                    case TimestepEnum.SEMIANNUALLY:
                        const startMonth = month < 6 ? 0 : 6;
                        const endMonth = month < 6 ? 5 : 11;
                        curStart = moment(date).startOf('year').add(startMonth, 'month');
                        curEnd = moment(date).startOf('year').add(endMonth, 'month').endOf('month');
                        break;

                    case TimestepEnum.ANNUALLY:
                        curStart = moment(date).startOf('year');
                        curEnd = moment(date).endOf('year');
                        break;

                    case TimestepEnum.BIENNIALLY:
                        curStart = (moment(date).startOf('year')).subtract(1, 'year');
                        curEnd = moment(date).endOf('year');
                        break;

                    default:
                        throw new Error(`Invalid date period: ${period}`);
                }

                return { start: curStart.format('YYYY-MM-DD'), end: curEnd.format('YYYY-MM-DD') };
            }
        } else {
            // The date string was not provided
            throw new Error(`Date string not provided`);
        }
    }

    public getCurrentFiscal(dateString: string | null | undefined, period: TimestepEnum): { start: string; end: string } {
        // Check if the date string was provided
        if (dateString) {
            // Get the date from the date string
            const date = moment(dateString, 'YYYY-MM-DD');

            if (period === TimestepEnum.DAILY) {
                return { start: date.format('YYYY-MM-DD'), end: date.format('YYYY-MM-DD') };
            } else {
                // Extract the year and month from the date string
                const year = moment(dateString, 'YYYY-MM-DD').year();
                const month = moment(dateString, 'YYYY-MM-DD').month();

                // Infer the fiscal year start based on the year and month
                // To determine the start date of week 1 of the fiscal year correctly,
                // we need to find the first Sunday on or after July 1st.
                // If July 1st falls on a Sunday, it is considered the start of week 1.
                // Otherwise, we need to find the next Sunday.
                const fiscalYearStart = moment({ year: year - 1, month: 6, day: 1 }).startOf('isoWeek');
                if (fiscalYearStart.day() !== 0) {
                    fiscalYearStart.day(7);
                }

                let curEnd!: moment.Moment;
                let curStart!: moment.Moment;

                switch (period) {
                    case TimestepEnum.WEEKLY:

                        // Calculate the fiscal week for the given date
                        const fiscalWeek = Math.ceil(date.diff(fiscalYearStart, 'weeks') + 1);

                        // Get the start and end dates of the fiscal week
                        curStart = moment(fiscalYearStart).add(fiscalWeek - 1, 'weeks');
                        curEnd = moment(curStart).add(6, 'days');
                        break;

                    case TimestepEnum.BI_WEEKLY:

                        // Calculate the fiscal biweek for the given date
                        const fiscalBiWeek = Math.ceil(date.diff(fiscalYearStart, 'weeks') / 2) + 1;

                        // Get the start and end dates of the fiscal biweek
                        curStart = moment(fiscalYearStart).add((fiscalBiWeek - 1) * 2, 'weeks');
                        curEnd = moment(curStart).add(13, 'days');
                        break;

                    case TimestepEnum.MONTHLY:

                        // Get the start and end dates of the fiscal month
                        curStart = moment({ year: year, month: month }).startOf('month');
                        curEnd = moment(curStart).endOf('month');
                        break;

                    case TimestepEnum.QUARTERLY:

                        // Calculate the fiscal quarter for the given date
                        const fiscalQuarter = Math.floor((month - 6) / 3) + 1;

                        // Get the start and end dates of the fiscal quarter
                        const startMonth = (fiscalQuarter - 1) * 3 + 6;
                        const endMonth = startMonth + 2;

                        curStart = moment({ year: year - (startMonth < 0 ? 1 : 0), month: startMonth % 12, day: 1 });
                        curEnd = moment({ year: year - (endMonth < 0 ? 1 : 0), month: endMonth % 12, day: 1 }).endOf('month');

                        break;

                    case TimestepEnum.SEMIANNUALLY:

                        // Determine the fiscal semi-annual period for the given date
                        const fiscalSemiAnnual = month < 6 ? 2 : 1;

                        // Get the start and end months of the fiscal semi-annual period
                        const _startMonth = fiscalSemiAnnual === 1 ? 6 : 0;
                        const _endMonth = fiscalSemiAnnual === 1 ? 11 : 5;

                        // Get the start and end dates of the fiscal semi-annual period
                        curStart = moment({ year: year, month: _startMonth, day: 1 });
                        curEnd = moment({ year: year, month: _endMonth, day: 1 }).endOf('month');
                        break;

                    case TimestepEnum.ANNUALLY:

                        // Get the start and end dates of the annual period
                        curStart = moment({ year: year - (month < 6 ? 1 : 0), month: 6, day: 1 });
                        curEnd = moment({ year: year + (month > 6 ? 1 : 0), month: 5, day: 30 }).endOf('month');

                        break;

                    case TimestepEnum.BIENNIALLY:

                        curStart = (moment({ year: year - (month < 6 ? 1 : 0), month: 6, day: 1 })).subtract(1, "year");
                        curEnd = moment({ year: year + (month > 6 ? 1 : 0), month: 5, day: 30 }).endOf('month');

                        break;


                    default:
                        throw new Error(`Invalid date period: ${period}`);
                }

                return { start: curStart.format('YYYY-MM-DD'), end: curEnd.format('YYYY-MM-DD') };
            }
        } else {
            // The date string was not provided
            throw new Error(`Date string not provided`);
        }
    }


    public getNext(endDateString: string | null | undefined, period: TimestepEnum, year: 'calendar' | 'fiscal'): { start: string; end: string } {
        if (year === 'fiscal') {
            return this.getNextFiscal(endDateString, period);
        } else {
            return this.getNextCalendar(endDateString, period);
        }
    }

    public getNextCalendar(endDateString: string | null | undefined, period: TimestepEnum): { start: string; end: string } {
        // Check if the date string was provided
        if (endDateString) {
            // Get the date from the date string
            const date = moment(endDateString, 'YYYY-MM-DD');

            // Extract the year and month from the date string
            const month = moment(endDateString, 'YYYY-MM-DD').month();

            let curEnd!: moment.Moment;
            let nextStart!: moment.Moment;
            let nextEnd!: moment.Moment;

            switch (period) {

                case TimestepEnum.DAILY:
                    nextStart = date.clone().add(1, 'day');
                    nextEnd = nextStart.clone();
                    break;

                case TimestepEnum.WEEKLY:
                    curEnd = moment(date).endOf('week');
                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().add(6, 'days');
                    break;

                case TimestepEnum.BI_WEEKLY:
                    curEnd = moment(date).add(1, 'week').endOf('week');
                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().add(13, 'days');
                    break;

                case TimestepEnum.MONTHLY:
                    curEnd = moment(date).endOf('month');
                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().endOf('month');
                    break;

                case TimestepEnum.QUARTERLY:
                    const quarter = Math.floor(month / 3) + 1;
                    curEnd = moment(date).startOf('year').add(quarter, 'quarter').subtract(1, 'day');
                    nextStart = curEnd.clone().add(1, 'day').startOf('quarter');
                    nextEnd = curEnd.clone().add(1, 'day').endOf('quarter');
                    break;

                case TimestepEnum.SEMIANNUALLY:
                    const endMonth = month < 6 ? 5 : 11;
                    curEnd = moment(date).startOf('year').add(endMonth, 'month').endOf('month');
                    nextStart = curEnd.clone().add(1, 'day').startOf('month');
                    nextEnd = curEnd.clone().add(1, 'day').endOf('month').add(5, 'months');
                    break;

                case TimestepEnum.ANNUALLY:
                    curEnd = moment(date).endOf('year');
                    nextStart = curEnd.clone().add(1, 'day').startOf('year');
                    nextEnd = curEnd.clone().add(1, 'day').endOf('year');
                    break;

                case TimestepEnum.BIENNIALLY:
                    curEnd = moment(date).endOf('year');
                    nextStart = curEnd.clone().add(1, 'day').startOf('year');
                    nextEnd = curEnd.clone().add(1, 'day').endOf('year').add(1, 'year');
                    break;

                default:
                    throw new Error(`Invalid date period: ${period}`);
            }

            return { start: nextStart.format('YYYY-MM-DD'), end: nextEnd.format('YYYY-MM-DD') };

        } else {
            // The date string was not provided
            throw new Error(`Date string not provided`);
        }
    }

    public getNextFiscal(dateString: string | null | undefined, period: TimestepEnum): { start: string; end: string } {

        // Check if the date string was provided
        if (dateString) {
            // Get the date from the date string
            const date = moment(dateString, 'YYYY-MM-DD');

            // Extract the year and month from the date string
            const year = moment(dateString, 'YYYY-MM-DD').year();
            const month = moment(dateString, 'YYYY-MM-DD').month();

            // Infer the fiscal year start based on the year and month
            // To determine the start date of week 1 of the fiscal year correctly,
            // we need to find the first Sunday on or after July 1st.
            // If July 1st falls on a Sunday, it is considered the start of week 1.
            // Otherwise, we need to find the next Sunday.
            const fiscalYearStart = moment({ year: year - 1, month: 6, day: 1 }).startOf('isoWeek');
            if (fiscalYearStart.day() !== 0) {
                fiscalYearStart.day(7);
            }

            let curEnd!: moment.Moment;
            let curStart!: moment.Moment;
            let nextStart!: moment.Moment;
            let nextEnd!: moment.Moment;

            switch (period) {

                case TimestepEnum.DAILY:
                    nextStart = date.clone().add(1, 'day');
                    nextEnd = nextStart.clone();
                    break;

                case TimestepEnum.WEEKLY:
                    curStart = moment(date).startOf('week');
                    curEnd = moment(date).endOf('week');
                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().add(6, 'days');
                    break;

                case TimestepEnum.BI_WEEKLY:
                    curStart = moment(date).startOf('week');
                    curEnd = moment(date).add(1, 'week').endOf('week');
                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().add(13, 'days');
                    break;

                case TimestepEnum.MONTHLY:
                    curStart = moment(date).startOf('month');
                    curEnd = moment(date).endOf('month');
                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().endOf('month');
                    break;

                case TimestepEnum.QUARTERLY:
                    // Calculate the fiscal quarter for the given date
                    const fiscalQuarter = Math.floor((month - 6) / 3) + 1;

                    // Get the end dates of the fiscal quarter
                    const startMonth1 = (fiscalQuarter - 1) * 3 + 6;
                    const endMonth1 = startMonth1 + 2;
                    curEnd = moment({ year: year - (endMonth1 < 0 ? 1 : 0), month: endMonth1 % 12, day: 1 }).endOf('month');

                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().endOf('quarter');
                    break;

                case TimestepEnum.SEMIANNUALLY:

                    // Determine the fiscal semi-annual period for the given date
                    const fiscalSemiAnnual = month < 6 ? 2 : 1;

                    // Get the end months of the fiscal semi-annual period
                    const _endMonth = fiscalSemiAnnual === 1 ? 11 : 5;

                    // Get the end dates of the fiscal semi-annual period
                    curEnd = moment({ year: year, month: _endMonth, day: 1 }).endOf('month');

                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().add(6, 'months').subtract(1, 'day');
                    break;

                case TimestepEnum.ANNUALLY:
                    curEnd = moment({ year: year + (month > 6 ? 1 : 0), month: 5, day: 30 }).endOf('month');
                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().add(1, 'year').subtract(1, 'day');
                    break;

                case TimestepEnum.BIENNIALLY:

                    curEnd = moment({ year: year + (month > 6 ? 1 : 0), month: 5, day: 30 }).endOf('month');
                    nextStart = curEnd.clone().add(1, 'day');
                    nextEnd = nextStart.clone().add(1, 'year').subtract(1, 'day');
                    break;

                default:
                    throw new Error(`Invalid date period: ${period}`);
            }

            return { start: nextStart.format('YYYY-MM-DD'), end: nextEnd.format('YYYY-MM-DD') };

        } else {
            // The date string was not provided
            throw new Error(`Date string not provided`);
        }
    }

    public getPrevious(startDateString: string | null | undefined, period: TimestepEnum, year: 'calendar' | 'fiscal'): { start: string; end: string } {
        if (year === 'fiscal') {
            return this.getPreviousFiscal(startDateString, period);
        } else {
            return this.getPreviousCalendar(startDateString, period);
        }
    }

    public getPreviousCalendar(dateString: string | null | undefined, period: TimestepEnum): { start: string; end: string } {

        // Check if the date string was provided
        if (dateString) {

            // Get the date from the date string
            const date = moment(dateString, 'YYYY-MM-DD');

            // Extract the ymonth from the date string
            const month = moment(dateString, 'YYYY-MM-DD').month();

            let curStart!: moment.Moment;
            let previousStart!: moment.Moment;
            let previousEnd!: moment.Moment;

            switch (period) {

                case TimestepEnum.DAILY:
                    previousEnd = date.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone();
                    break;

                case TimestepEnum.WEEKLY:
                    curStart = moment(date).startOf('week');
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(6, 'days');
                    break;

                case TimestepEnum.BI_WEEKLY:
                    curStart = moment(date).startOf('week');
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(13, 'days');
                    break;

                case TimestepEnum.MONTHLY:
                    curStart = moment(date).startOf('month');
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().startOf('month');
                    break;

                case TimestepEnum.QUARTERLY:
                    const quarter = Math.floor(month / 3) + 1;
                    curStart = moment(date).startOf('year').add(quarter - 1, 'quarter');
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().startOf('quarter');
                    break;

                case TimestepEnum.SEMIANNUALLY:
                    const startMonth = month < 6 ? 0 : 6;
                    curStart = moment(date).startOf('year').add(startMonth, 'month');
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(5, 'months').startOf('month');
                    break;

                case TimestepEnum.ANNUALLY:
                    curStart = moment(date).startOf('year');
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().startOf('year');
                    break;

                case TimestepEnum.BIENNIALLY:
                    curStart = (moment(date).startOf('year')).subtract(1, 'year');
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(1, 'year').startOf('year');
                    break;

                default:
                    throw new Error(`Invalid date period: ${period}`);
            }

            return { start: previousStart.format('YYYY-MM-DD'), end: previousEnd.format('YYYY-MM-DD') };
        } else {
            // The date string was not provided
            throw new Error(`Date string not provided`);
        }
    }

    public getPreviousFiscal(dateString: string | null | undefined, period: TimestepEnum): { start: string; end: string } {

        // Check if the date string was provided
        if (dateString) {

            // Get the date from the date string
            const date = moment(dateString, 'YYYY-MM-DD');

            // Extract the year and month from the date string
            const year = moment(dateString, 'YYYY-MM-DD').year();
            const month = moment(dateString, 'YYYY-MM-DD').month();

            // Infer the fiscal year start based on the year and month
            // To determine the start date of week 1 of the fiscal year correctly,
            // we need to find the first Sunday on or after July 1st.
            // If July 1st falls on a Sunday, it is considered the start of week 1.
            // Otherwise, we need to find the next Sunday.
            const fiscalYearStart = moment({ year: year - 1, month: 6, day: 1 }).startOf('isoWeek');
            if (fiscalYearStart.day() !== 0) {
                fiscalYearStart.day(7);
            }

            let curStart!: moment.Moment;
            let curEnd!: moment.Moment;
            let previousEnd!: moment.Moment;
            let previousStart!: moment.Moment;

            switch (period) {

                case TimestepEnum.DAILY:
                    previousEnd = date.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone();
                    break;

                case TimestepEnum.WEEKLY:

                    // Calculate the fiscal week for the given date
                    const fiscalWeek = Math.ceil(date.diff(fiscalYearStart, 'weeks') + 1);

                    // Get the start date of the fiscal week
                    curStart = moment(fiscalYearStart).add(fiscalWeek - 1, 'weeks');

                    // Initialise the previous end and start dates
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(6, 'days');

                    break;

                case TimestepEnum.BI_WEEKLY:

                    // Calculate the fiscal biweek for the given date
                    const fiscalBiWeek = Math.ceil(date.diff(fiscalYearStart, 'weeks') / 2) + 1;

                    // Get the start date of the fiscal biweek
                    curStart = moment(fiscalYearStart).add((fiscalBiWeek - 1) * 2, 'weeks');

                    // Initialise the previous end and start dates                    
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(13, 'days');

                    break;

                case TimestepEnum.MONTHLY:

                    // Get the start date of the fiscal month
                    curStart = moment({ year: year, month: month }).startOf('month');

                    // Initialise the previous end and start dates                     
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = moment(previousEnd).startOf('month');
                    break;

                case TimestepEnum.QUARTERLY:

                    // Calculate the fiscal quarter for the given date
                    const fiscalQuarter = Math.floor((month - 6) / 3) + 1;

                    // Get the start dates of the fiscal quarter
                    const startMonth = (fiscalQuarter - 1) * 3 + 6;
                    curStart = moment({ year: year - (startMonth < 0 ? 1 : 0), month: startMonth % 12, day: 1 });

                    // Initialise the previous end and start dates                      
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().startOf('quarter');

                    break;

                case TimestepEnum.SEMIANNUALLY:

                    // Determine the fiscal semi-annual period for the given date
                    const fiscalSemiAnnual = month < 6 ? 2 : 1;

                    // Get the start and end months of the fiscal semi-annual period
                    const _startMonth = fiscalSemiAnnual === 1 ? 6 : 0;

                    // Get the start dates of the fiscal semi-annual period
                    curStart = moment({ year: year, month: _startMonth, day: 1 });

                    // Initialise the previous end and start dates  
                    previousEnd = curStart.clone().subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(6, 'months').add(1, 'day');
                    break;

                case TimestepEnum.ANNUALLY:

                    curStart = moment({ year: year - (month < 6 ? 1 : 0), month: 6, day: 1 });
                    previousEnd = curStart.subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(1, 'year').add(1, 'day');
                    break;

                case TimestepEnum.BIENNIALLY:

                    curStart = (moment({ year: year - (month < 6 ? 1 : 0), month: 6, day: 1 })).subtract(1, "year");
                    previousEnd = curStart.subtract(1, 'day');
                    previousStart = previousEnd.clone().subtract(1, 'year').add(1, 'day');
                    break;

                default:
                    throw new Error(`Invalid date period: ${period}`);
            }

            return { start: previousStart.format('YYYY-MM-DD'), end: previousEnd.format('YYYY-MM-DD') };
        } else {
            // The date string was not provided
            throw new Error(`Date string not provided`);
        }
    }



    public isDateBefore(dateString1: string | null | undefined, dateString2: string | null | undefined): boolean {
        if (dateString1 && dateString2) {
            const date1: Date = new Date(dateString1);
            const date2: Date = new Date(dateString2);
            return date1 < date2;
        } else {
            return false;
        }
    }

    public isDateAfter(dateString1: string | null | undefined, dateString2: string | null | undefined): boolean {
        if (dateString1 && dateString2) {
            const date1: Date = new Date(dateString1);
            const date2: Date = new Date(dateString2);
            return date1 > date2;
        } else {
            return false;
        }
    }


    private getFiscalWeek(dateString: string): number {
        const date = new Date(dateString);
        const month = date.getMonth();
        const day = date.getDate();
        const currentFiscalYear = month >= 6 ? date.getFullYear() : date.getFullYear() - 1;
        const fiscalYearStart = new Date(currentFiscalYear, 6, 1); // July is the 7th month (0-indexed)
        const daysSinceFiscalYearStart = Math.ceil((date.getTime() - fiscalYearStart.getTime()) / (24 * 60 * 60 * 1000));
        const fiscalWeek = Math.ceil(daysSinceFiscalYearStart / 7);
        return fiscalWeek;
    }

    private getFiscalQuarter(dateString: string): number {
        const date = new Date(dateString);
        const month = date.getMonth();
        const currentFiscalYear = month >= 6 ? date.getFullYear() : date.getFullYear() - 1;
        const fiscalYearStart = new Date(currentFiscalYear, 6, 1); // July is the 7th month (0-indexed)
        const daysSinceFiscalYearStart = Math.ceil((date.getTime() - fiscalYearStart.getTime()) / (24 * 60 * 60 * 1000));

        // We start by dividing the number of days since the start of the fiscal year by the number of days in a quarter, which is 91. 
        // This gives us a fractional value that represents the number of quarters that have passed since the start of the fiscal year. 
        // Next, we take the remainder of this value when divided by 4. Since there are 4 quarters in a fiscal year, this gives us a value between 0 and 3 that represents which quarter we're currently in. 
        // Finally, we add 1 to this value to get the actual fiscal quarter number, since the first quarter is Q1, not Q0.
        const fiscalQuarter = Math.floor((daysSinceFiscalYearStart / 91) % 4) + 1;
        return fiscalQuarter;
    }



    private getSuffix(day: number): string {
        switch (day) {
            case 1:
            case 21:
            case 31:
                return 'st';
            case 2:
            case 22:
                return 'nd';
            case 3:
            case 23:
                return 'rd';
            default:
                return 'th';
        }
    }

    private getWeekStartDate(date: Date): Date {
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    private getWeekEndDate(date: Date): Date {
        const d = new Date(date);
        const dayOfWeek = d.getDay();
        const diff = d.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek);
        return new Date(d.setDate(diff));
    }


    private getDailyDescriptor(startDateString: string, endDateString: string): string {

        const startDate = moment(startDateString);
        const endDate = moment(endDateString);

        const startDay = startDate.format('D');
        const endDay = endDate.format('D');
        const startMonth = startDate.format('MMMM');
        const endMonth = endDate.format('MMMM');
        const startYear = startDate.format('YYYY');
        const endYear = endDate.format('YYYY');

        if (startDate.isSame(endDate, 'day')) {
            // Same day
            return `${startMonth} ${startDay}, ${startYear}`;
        } else if (startYear === endYear && startMonth === endMonth) {
            // Same month and year and different days
            return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
        } else if (startYear === endYear) {
            // Same year and different months
            return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
        } else {
            // Different years
            return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
        }
    }


    private getWeeklyDescriptor(startDateString: string, endDateString: string, year: 'calendar' | 'fiscal'): string {
        const startDate = moment(startDateString);
        const endDate = moment(endDateString);
    
        const startWeek = startDate.format('W');
        const endWeek = endDate.format('W');
        const startYear = year === 'calendar' ? startDate.format('YYYY') : startDate.format('YYYY') + 'F';
        const endYear = year === 'calendar' ? endDate.format('YYYY') : endDate.format('YYYY') + 'F';
    
        if (startYear === endYear) {
            return `W${startWeek} - W${endWeek}, ${startYear}`;
        } else {
            return `W${startWeek} ${startYear} - W${endWeek} ${endYear}`;
        }
    }
    
    private getBiweeklyDescriptor(startDateString: string, endDateString: string, year: 'calendar' | 'fiscal'): string {
        const startDate = moment(startDateString);
        const endDate = moment(endDateString);
    
        const startWeek = startDate.format('W');
        const endWeek = endDate.format('W');
        const startYear = year === 'calendar' ? startDate.format('YYYY') : startDate.format('YYYY') + 'F';
        const endYear = year === 'calendar' ? endDate.format('YYYY') : endDate.format('YYYY') + 'F';
    
        if (startYear === endYear && parseInt(startWeek) % 2 === 1 && parseInt(endWeek) % 2 === 0) {
            // Same year and consecutive bi-weeks
            return `W${parseInt(startWeek)}-${parseInt(endWeek)}, ${startYear}`;
        } else if (startYear === endYear) {
            // Same year and non-consecutive bi-weeks
            return `W${startWeek} - W${endWeek}, ${startYear}`;
        } else {
            // Different years
            return `W${startWeek} ${startYear} - W${endWeek} ${endYear}`;
        }

    }
    

    private getMonthlyDescriptor(startDateString: string, endDateString: string): string {

        const startDate = moment(startDateString);
        const endDate = moment(endDateString);

        const startMonth = startDate.format('MMMM');
        const endMonth = endDate.format('MMMM');
        const startYear = startDate.format('YYYY');
        const endYear = endDate.format('YYYY');

        if (startYear === endYear && startDate.month() === endDate.month()) {
            // Same month and year
            return `${startMonth} ${startYear}`;
        } else if (startYear === endYear) {
            // Same year and different months
            return `${startMonth} - ${endMonth} ${startYear}`;
        } else {
            // Different years
            return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
        }
    }

    private getQuarterlyDescriptor(startDateString: string, endDateString: string, year: 'calendar' | 'fiscal'): string {
        const startDate = moment(startDateString);
        const endDate = moment(endDateString);
    
        const startQuarter = Math.floor(startDate.month() / 3) + 1;
        const endQuarter = Math.floor(endDate.month() / 3) + 1;
        const startYear = year === 'calendar' ? startDate.format('YYYY') : startDate.format('YYYY') + 'F';
        const endYear = year === 'calendar' ? endDate.format('YYYY') : endDate.format('YYYY') + 'F';
    
        if (startYear === endYear && startQuarter === endQuarter) {
            // Same quarter and year
            return `Q${startQuarter}, ${startYear}`;
        } else if (startYear === endYear) {
            // Same year and different quarters
            return `Q${startQuarter} - Q${endQuarter}, ${startYear}`;
        } else {
            // Different years
            return `Q${startQuarter}, ${startYear} - Q${endQuarter}, ${endYear}`;
        }
    }
    
    private getSemiannualDescriptor(startDateString: string, endDateString: string, year: 'calendar' | 'fiscal'): string {
        const startDate = moment(startDateString);
        const endDate = moment(endDateString);
    
        const startMonth = startDate.format('MMMM');
        const endMonth = endDate.format('MMMM');
        const startYear = year === 'calendar' ? startDate.format('YYYY') : startDate.format('YYYY') + 'F';
        const endYear = year === 'calendar' ? endDate.format('YYYY') : endDate.format('YYYY') + 'F';
    
        const isFiscalYear = year === 'fiscal';
        const fiscalYearStart = moment({ year: parseInt(startYear), month: 6, day: 1 }).startOf('isoWeek');
        if (fiscalYearStart.day() !== 0) {
            fiscalYearStart.day(7);
        }
    
        if (startYear === endYear && startDate.isBefore(fiscalYearStart) === isFiscalYear && endDate.isBefore(fiscalYearStart) === isFiscalYear) {
            // Same half-year and year
            return `${startMonth} - ${endMonth} ${startYear}`;
        } else if (startYear === endYear) {
            // Same year and different half-years
            return `H${startDate.format('H')}, ${startYear}`;
        } else {
            // Different years
            return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
        }
    }
    
    
    private getAnnualDescriptor(startDateString: string, endDateString: string, year: 'calendar' | 'fiscal'): string {
        const startDate = moment(startDateString);
        const endDate = moment(endDateString);
    
        const startYear = year === 'calendar' ? startDate.format('YYYY') : startDate.format('YYYY') + 'F';
        const endYear = year === 'calendar' ? endDate.format('YYYY') : endDate.format('YYYY') + 'F';
    
        if (startYear === endYear) {
            // Same year
            return `${startYear}`;
        } else {
            // Different years
            return `${startYear}-${endYear}`;
        }
    }
    
    private getBiennialDescriptor(startDateString: string, endDateString: string, year: 'calendar' | 'fiscal'): string {
        const startDate = moment(startDateString);
        const endDate = moment(endDateString);
    
        const startYear = year === 'calendar' ? startDate.format('YYYY') : startDate.format('YYYY') + 'F';
        const endYear = year === 'calendar' ? endDate.format('YYYY') : endDate.format('YYYY') + 'F';
    
        return `${startYear}${year === 'fiscal' ? '/' : '-'}${endYear}`;
    }
    
    

}
