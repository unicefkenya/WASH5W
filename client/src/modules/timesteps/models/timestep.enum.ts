import { Timestep } from "./timestep.model";

export class TimestepEnum {

    static readonly DAILY = {
        "id": 1,
        "data": {
            "name": "Daily"
        },
        "version": 1
    };

    static readonly WEEKLY = {
        "id": 2,
        "data": {
            "name": "Weekly",
        },
        "version": 1
    };

    static readonly BI_WEEKLY = {
        "id": 3,
        "data": {
            "name": "Biweekly"
        },
        "version": 1
    };

    static readonly MONTHLY = {
        "id": 4,
        "data": {
            "name": "Monthly"
        },
        "version": 1
    };

    static readonly QUARTERLY = {
        "id": 5,
        "data": {
            "name": "Quartely"
        },
        "version": 1
    };

    static readonly SEMIANNUALLY = {
        "id": 6,
        "data": {
            "name": "Semiannually"
        },
        "version": 1
    };

    static readonly ANNUALLY = {
        "id": 7,
        "data": {
            "name": "Annually"
        },
        "version": 1
    };

    static readonly BIENNIALLY = {
        "id": 8,
        "data": {
            "name": "Biennially"
        },
        "version": 1
    };

    static getTimesteps(): Timestep[] {
        return [
            this.DAILY,
            this.WEEKLY,
            this.BI_WEEKLY,
            this.MONTHLY,
            this.QUARTERLY,
            this.SEMIANNUALLY,
            this.ANNUALLY,
            this.BIENNIALLY
        ];
    }

    static getTimestepById(id: number) {

        if (id === TimestepEnum.DAILY.id) {
            return TimestepEnum.DAILY;
        } else if (id === TimestepEnum.WEEKLY.id) {
            return TimestepEnum.WEEKLY;
        } else if (id === TimestepEnum.BI_WEEKLY.id) {
            return TimestepEnum.BI_WEEKLY;
        } else if (id === TimestepEnum.MONTHLY.id) {
            return TimestepEnum.MONTHLY;
        } else if (id === TimestepEnum.QUARTERLY.id) {
            return TimestepEnum.QUARTERLY;
        } else if (id === TimestepEnum.SEMIANNUALLY.id) {
            return TimestepEnum.SEMIANNUALLY;
        } else if (id === TimestepEnum.ANNUALLY.id) {
            return TimestepEnum.ANNUALLY;
        } else if (id === TimestepEnum.BIENNIALLY.id) {
            return TimestepEnum.BIENNIALLY;
        } else {
            throw new Error(`Invalid timestep ID: ${id}`);
        }
        
    }
}