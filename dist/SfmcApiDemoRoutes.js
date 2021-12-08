'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const SfmcApiHelper_1 = require("./SfmcApiHelper");
const Utils_1 = require("./Utils");
class SfmcApiDemoRoutes {
    constructor() {
        // Instance variables
        this._apiHelper = new SfmcApiHelper_1.default();
        /**
         * GET handler for /apidemoloaddata
         * loadData: called by the demo app to load sample data into the Data Extension "DF18Demo";'
         *
         * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-apis.meta/mc-apis/postDataExtensionRowsetByKey.htm
         *
         */
        // public loadData(req: express.Request, res: express.Response)
        // {
        //     let self = this;
        //     Utils.logInfo("loadData route entered.");
        //     self._apiHelper.loadData(req, res);
        // }
    }
    /**
     * GET handler for /apidemooauthtoken
     * getOAuthAccessToken: called by demo app to get an OAuth access token with ClientId/ClientSecret in environment variables
     *
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     *
     */
    getOAuthAccessToken(req, res) {
        let self = this;
        let sessionId = req.session.id;
        let clientId = process.env.CLIENTID;
        let clientSecret = process.env.CLIENTSECRET;
        req.session.oauthAccessToken = "";
        req.session.oauthAccessTokenExpiry = "";
        Utils_1.default.logInfo("getOAuthAccessToken route entered. SessionId = " + sessionId);
        if (clientId && clientSecret) {
            Utils_1.default.logInfo("Getting OAuth Access Token with ClientID and ClientSecret from in environment variables.");
            self._apiHelper.getOAuthAccessToken(clientId, clientSecret)
                .then((result) => {
                req.session.oauthAccessToken = result.oauthAccessToken;
                req.session.oauthAccessTokenExpiry = result.oauthAccessTokenExpiry;
                res.status(result.status).send(result.statusText);
            })
                .catch((err) => {
                res.status(500).send(err);
            });
        }
        else {
            // error
            let errorMsg = "ClientID or ClientSecret *not* found in environment variables.";
            Utils_1.default.logError(errorMsg);
            res.status(500).send(errorMsg);
        }
    }
}
exports.default = SfmcApiDemoRoutes;
//# sourceMappingURL=SfmcApiDemoRoutes.js.map