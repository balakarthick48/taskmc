'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Utils_1 = require("./Utils");
const xml2js = require("xml2js");
class SfmcApiHelper {
    constructor() {
        // Instance variables
        this.client_id = "";
        this.client_secret = "";
        this._accessToken = "";
        this.member_id = "514018007";
        this.soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
        this.FolderID = "";
        this._deExternalKey = "DF18Demo";
        this._sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";
    }
    /**
     * getOAuthAccessToken: POSTs to SFMC Auth URL to get an OAuth access token with the given ClientId and ClientSecret
     *
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     *
     */
    getOAuthAccessToken(client_id, client_secret) {
        let self = this;
        Utils_1.default.logInfo("getOAuthAccessToken called.");
        Utils_1.default.logInfo("Using specified ClientID and ClientSecret to get OAuth token...");
        let headers = {
            'Content-Type': 'application/json',
        };
        let postBody = {
            "grant_type": "client_credentials",
            "client_id": process.env.CLIENTID,
            "client_secret": process.env.CLIENTSECRET
        };
        return self.getOAuthTokenHelper(headers, postBody);
    }
    /**
     * getOAuthTokenHelper: Helper method to POST the given header & body to the SFMC Auth endpoint
     *
     */
    getOAuthTokenHelper(headers, postBody) {
        return new Promise((resolve, reject) => {
            // POST to Marketing Cloud REST Auth service and get back an OAuth access token.
            let sfmcAuthServiceApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";
            axios_1.default.post(sfmcAuthServiceApiUrl, postBody, { "headers": headers })
                .then((response) => {
                // success
                let accessToken = response.data.access_token;
                let tokenExpiry = new Date();
                let jsonData = response.data.jsonData;
                tokenExpiry.setSeconds(tokenExpiry.getSeconds() + response.data.expiresIn);
                Utils_1.default.logInfo("Got OAuth token: " + accessToken + ", expires = " + tokenExpiry);
                //console.log("token:",accessToken);
                console.log("response:", response.data);
                resolve({
                    oauthAccessToken: accessToken,
                    oauthAccessTokenExpiry: tokenExpiry,
                    JSON: jsonData,
                    status: response.status,
                    statusText: response.statusText + "\n" + Utils_1.default.prettyPrintJson(JSON.stringify(response.data))
                });
            })
                .catch((error) => {
                // error
                let errorMsg = "Error getting OAuth Access Token.";
                errorMsg += "\nMessage: " + error.message;
                errorMsg += "\nStatus: " + error.response ? error.response.status : "<None>";
                errorMsg += "\nResponse data: " + error.response ? Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data)) : "<None>";
                Utils_1.default.logError(errorMsg);
                reject(errorMsg);
            });
        });
    }
    domainConfigurationDECheck(req, res) {
        //this.getRefreshTokenHelper(this._accessToken, res);
        console.log("domainConfigurationDECheck:" + req.body.memberid);
        console.log("domainConfigurationDECheck:" + req.body.soapInstance);
        console.log("domainConfigurationDECheck:" + req.body.refreshToken);
        Utils_1.default.logInfo("domainConfigurationDECheck1:" + req.body.FolderID);
        //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);
        //this.getRefreshTokenHelper(this._accessToken, res);
        this.getOAuthAccessToken(this.client_id, this.client_secret);
        Utils_1.default.logInfo("domainConfigurationDECheck:" + JSON.stringify(Response.oauthAccessToken));
        let soapMessage = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
            "    <s:Header>" +
            '        <a:Action s:mustUnderstand="1">Retrieve</a:Action>' +
            '        <a:To s:mustUnderstand="1">' +
            req.body.soapInstance +
            "Service.asmx" +
            "</a:To>" +
            '        <fueloauth xmlns="http://exacttarget.com">' +
            Response.oauthAccessToken +
            "</fueloauth>" +
            "    </s:Header>" +
            '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
            '        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
            "            <RetrieveRequest>" +
            "                <ObjectType>DataExtension</ObjectType>" +
            "                <Properties>ObjectID</Properties>" +
            "                <Properties>CustomerKey</Properties>" +
            "                <Properties>Name</Properties>" +
            '                <Filter xsi:type="SimpleFilterPart">' +
            "                    <Property>Name</Property>" +
            "                    <SimpleOperator>equals</SimpleOperator>" +
            "                    <Value>Domain Configuration-" +
            req.body.memberid +
            "</Value>" +
            "                </Filter>" +
            "            </RetrieveRequest>" +
            "        </RetrieveRequestMsg>" +
            "    </s:Body>" +
            "</s:Envelope>";
        return new Promise((resolve, reject) => {
            let headers = {
                "Content-Type": "text/xml",
                SOAPAction: "Retrieve",
            };
            axios_1.default({
                method: "post",
                url: "" + req.body.soapInstance + "Service.asmx" + "",
                data: soapMessage,
                headers: { "Content-Type": "text/xml" },
            })
                .then((response) => {
                var extractedData = "";
                let sendresponse = {};
                var parser = new xml2js.Parser();
                parser.parseString(response.data, (err, result) => {
                    let DomainConfiguration = result["soap:Envelope"]["soap:Body"][0]["RetrieveResponseMsg"][0]["Results"];
                    if (DomainConfiguration != undefined) {
                        let DEexternalKeyDomainConfiguration = DomainConfiguration[0]["CustomerKey"];
                        //    this.DEexternalKeyDomainConfiguration =;
                        //    DomainConfiguration[0]["CustomerKey"];
                        sendresponse = {
                            statusText: "Domain Configuration Data Extension already created",
                            soap_instance_url: req.body.soapInstance,
                            member_id: req.body.memberid,
                            DEexternalKeyDomainConfiguration: DEexternalKeyDomainConfiguration,
                        };
                        res.status(200).send(sendresponse);
                    }
                    else {
                        this.creatingDomainConfigurationDE(req, res, req.body.memberid, req.body.soapInstance, req.body.FolderID);
                    }
                });
            })
                .catch((error) => {
                // error
                let errorMsg = "Error getting the 'Domain Configuration' Data extension properties......";
                errorMsg += "\nMessage: " + error.message;
                errorMsg +=
                    "\nStatus: " + error.response
                        ? error.response.status
                        : "<None>";
                errorMsg +=
                    "\nResponse data: " + error.response.data
                        ? Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data))
                        : "<None>";
                Utils_1.default.logError(errorMsg);
                reject(errorMsg);
            });
        });
        // .catch((error: any,res:any) => {
        //   res
        //     .status(500)
        //     .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
        // });
    }
    creatingDomainConfigurationDE(req, res, member_id, soap_instance_url, FolderID) {
        //this.getRefreshTokenHelper(this._accessToken, res);
        console.log("creatingDomainConfigurationDE:" + member_id);
        console.log("creatingDomainConfigurationDE:" + soap_instance_url);
        Utils_1.default.logInfo("creatingDomainConfigurationDE:" + FolderID);
        //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);
        let refreshTokenbody = "";
        this.getOAuthAccessToken(this.client_id, this.client_secret)
            .then((response) => {
            Utils_1.default.logInfo("creatingDomainConfigurationDE:" + JSON.stringify(response.oauthAccessToken));
            let DCmsg = '<?xml version="1.0" encoding="UTF-8"?>' +
                '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
                "    <s:Header>" +
                '        <a:Action s:mustUnderstand="1">Create</a:Action>' +
                '        <a:To s:mustUnderstand="1">' +
                soap_instance_url +
                "Service.asmx" +
                "</a:To>" +
                '        <fueloauth xmlns="http://exacttarget.com">' +
                response.oauthAccessToken +
                "</fueloauth>" +
                "    </s:Header>" +
                '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
                '        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
                '            <Objects xsi:type="DataExtension">' +
                "                <CategoryID>" +
                FolderID +
                "</CategoryID>" +
                "                <CustomerKey>Pashtek Developer-" +
                member_id +
                "</CustomerKey>" +
                "                <Name>Pashtek Developer-" +
                member_id +
                "</Name>" +
                "                <Fields>" +
                "                    <Field>" +
                "                        <CustomerKey>Name</CustomerKey>" +
                "                        <Name>Name</Name>" +
                "                        <FieldType>Text</FieldType>" +
                "                        <MaxLength>50</MaxLength>" +
                "                        <IsRequired>true</IsRequired>" +
                "                        <IsPrimaryKey>false</IsPrimaryKey>" +
                "                    </Field>" +
                "                    <Field>" +
                "                        <CustomerKey>Phone NUmber</CustomerKey>" +
                "                        <Name>Phone Number</Name>" +
                "                        <FieldType>Number</FieldType>" +
                "                        <MaxLength>10</MaxLength>" +
                "                        <IsRequired>true</IsRequired>" +
                "                        <IsPrimaryKey>true</IsPrimaryKey>" +
                "                    </Field>" +
                "                    <Field>" +
                "                        <CustomerKey>Position</CustomerKey>" +
                "                        <Name>Position</Name>" +
                "                        <FieldType>Text</FieldType>" +
                "                        <MaxLength>20</MaxLength>" +
                "                        <IsRequired>true</IsRequired>" +
                "                        <IsPrimaryKey>false</IsPrimaryKey>" +
                "                    </Field>" +
                "                    <Field>" +
                "                        <CustomerKey>Years of Experience</CustomerKey>" +
                "                        <Name>Years of Experience</Name>" +
                "                        <FieldType>Number</FieldType>" +
                "                        <MaxLength>5</MaxLength>" +
                "                        <IsRequired>true</IsRequired>" +
                "                        <IsPrimaryKey>false</IsPrimaryKey>" +
                "                    </Field>" +
                "                </Fields>" +
                "            </Objects>" +
                "        </CreateRequest>" +
                "    </s:Body>" +
                "</s:Envelope>";
            return new Promise((resolve, reject) => {
                let headers = {
                    "Content-Type": "text/xml",
                };
                axios_1.default({
                    method: "post",
                    url: "" + soap_instance_url + "Service.asmx" + "",
                    data: DCmsg,
                    headers: headers,
                })
                    .then((response) => {
                    response.data,
                        (err, result) => {
                            let DomainConfiguration = result["soap:Envelope"]["soap:Body"][0]["CreateResponse"][0]["Results"];
                            if (DomainConfiguration != undefined) {
                                let DEexternalKeyDomainConfiguration = DomainConfiguration[0]["Object"][0]["CustomerKey"];
                                //this.DEexternalKeyDomainConfiguration =
                                // DomainConfiguration[0]["Object"][0]["CustomerKey"];
                                let sendresponse = {};
                                sendresponse = {
                                    refreshToken: refreshTokenbody,
                                    statusText: "Domain Configuration Data extension has been created Successfully",
                                    soap_instance_url: soap_instance_url,
                                    member_id: member_id,
                                    DEexternalKeyDomainConfiguration: DEexternalKeyDomainConfiguration,
                                };
                                res.status(200).send(sendresponse);
                                /*  res
                              .status(200)
                              .send(
                                "Domain Configuration Data extension has been created Successfully"
                              );*/
                            }
                        };
                })
                    .catch((error) => {
                    // error
                    let errorMsg = "Error creating the Domain Configuration Data extension......";
                    errorMsg += "\nMessage: " + error.message;
                    errorMsg +=
                        "\nStatus: " + error.response
                            ? error.response.status
                            : "<None>";
                    errorMsg +=
                        "\nResponse data: " + error.response.data
                            ? Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data))
                            : "<None>";
                    Utils_1.default.logError(errorMsg);
                    reject(errorMsg);
                });
            });
        })
            .catch((error) => {
            res
                .status(500)
                .send(Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data)));
        });
    }
}
exports.default = SfmcApiHelper;
//# sourceMappingURL=SfmcApiHelper.js.map