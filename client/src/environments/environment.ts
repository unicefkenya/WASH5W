const BASE_URL = 'http://localhost';
// const BASE_URL = 'http://wash.water.go.ke';

export const environment = {

    aggregationIntervalInMinutes: 5,

    // Indicators module customisations
    indicators: {
        logical: true,
        numbered: true,
        dissaggregation: [{
            "scheme": "Involvement",
            "parameters": ["m", "f", "y", "e", "pwd"]
        }]
    },

    production: false,

    system: "Reporting Tool",

    response: {
        cumulative: true
    },

    // The unique identifiers of the customisable user roles
    roles: {
        reviewers: [3]
    },

    // The urls of customisable system paths
    urls: {
        api: BASE_URL + ':3000',
        client: BASE_URL + ':4200',
        mail: BASE_URL + ':3001',
        tokens: BASE_URL + ':3002',
        ftp: BASE_URL + ':3003',
        ftp_resources: '/home/resources'
    },

    // Set the default year to fiscal or calendar
    year: "calendar"

};
