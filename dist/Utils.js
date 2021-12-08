'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const shortid = require("shortid");
// Configure logging
winston.configure({
    level: process.env.LOG_LEVEL || "debug",
    transports: [new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        })
    ]
});
class Utils {
    /**
     * logInfo: Helper to log Info messages
     *
     */
    static logInfo(msg) {
        winston.info(msg);
    }
    /**
     * logError: Helper to log Error messages
     *
     */
    static logError(msg) {
        winston.error(msg);
    }
    /**
     * prettyPrintJson: helper to pretty print a flat JSON string
     *
     */
    static prettyPrintJson(jsonString) {
        return JSON.stringify(JSON.parse(jsonString), null, 2);
    }
    /**
     * initSampleDataAndRenderView: Called to render /apidemo and /appdemo views
     *
     * Helper to init sample JSON data for this session and pass the session to the view
     * This lets the view access session variables (e.g. JWT JSON and sample data) for display purposes.
     *
     */
    static initSampleDataAndRenderView(req, res, viewName) {
        Utils.initSampleData()
            .then((sampleData) => {
            req.session.sampleJsonData = sampleData;
            res.render(viewName, { session: req.session });
        });
    }
    /**
     * initSampleData: Called on session start to generate sample JSON data to insert into Data Extension
     *
     */
    static initSampleData() {
        Utils.logInfo("initSampleData called.");
        return new Promise((resolve, reject) => {
            let sampleData = [
                {
                    keys: {
                        id: shortid.generate()
                    },
                    values: {
                        name: 'Hari - ',
                        email: 'hari-' + '@gmail.com',
                    }
                },
                {
                    keys: {
                        id: shortid.generate()
                    },
                    values: {
                        name: 'Mani - ',
                        email: 'mani-' + '@gmail.com'
                    }
                }
            ];
            resolve(Utils.prettyPrintJson(JSON.stringify(sampleData)));
        });
    }
}
exports.default = Utils;
//# sourceMappingURL=Utils.js.map