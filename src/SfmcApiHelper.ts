'use strict';

import axios from 'axios';
import express = require("express");
import { request } from 'http';
import Utils from './Utils';
import xml2js = require("xml2js");

let mc_accessToken = require("mc_generic_methods");
mc_accessToken()
    .then((res: any) => {
      // If the function successfully retrieves the data, it enters this block
      console.log("Mc access token library check >>>>> ",res.body); // Print the contest data on the console
    })
    .catch((err: any) => {
      console.log(err); // Error handler
    });

export default class SfmcApiHelper
{
    // Instance variables
  private client_id="";
   
  private client_secret="";
  // private _accessToken = "";
  private oauthAccessToken=""; 
  private member_id = "514018007";
  private soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
  private _deExternalKey = "DF20Demo";
  private _sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";

    /**
     * getOAuthAccessToken: POSTs to SFMC Auth URL to get an OAuth access token with the given ClientId and ClientSecret
     * 
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     * 
     */
    public getOAuthAccessToken(client_id: string, client_secret: string) : Promise<any>
    {
        let self = this;
        Utils.logInfo("getOAuthAccessToken called.");
        Utils.logInfo("Using specified ClientID and ClientSecret to get OAuth token...");

        let headers = {
            'Content-Type': 'application/json',
        };

        let postBody = {

            "grant_type": "client_credentials",
            "client_id": process.env.clientid,
            "client_secret": process.env.clientsecret
        };

        return self.getOAuthTokenHelper(headers, postBody);
    }


    /**
     * getOAuthTokenHelper: Helper method to POST the given header & body to the SFMC Auth endpoint
     * 
     */
    public getOAuthTokenHelper(headers : any, postBody: any) : Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            // POST to Marketing Cloud REST Auth service and get back an OAuth access token.
            let sfmcAuthServiceApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";
            axios.post(sfmcAuthServiceApiUrl, postBody, {"headers" : headers})
            .then((response: any) => {
                // success
                let accessToken = response.data.access_token;
                let tokenExpiry = new Date();
                let jsonData = response.data.jsonData;
                tokenExpiry.setSeconds(tokenExpiry.getSeconds() + response.data.expiresIn);
                Utils.logInfo("Got OAuth token: " + accessToken + ", expires = " +  tokenExpiry);
                console.log("response:",response.data);
                
                resolve(
                {
                    oauthAccessToken: accessToken,
                    oauthAccessTokenExpiry: tokenExpiry,
                    JSON:jsonData,
                    status: response.status,
                    statusText: response.statusText + "\n" + Utils.prettyPrintJson(JSON.stringify(response.data))
                });
            })
            .catch((error: any) => {
                // error
                let errorMsg = "Error getting OAuth Access Token.";
                errorMsg += "\nMessage: " + error.message;
                errorMsg += "\nStatus: " + error.response ? error.response.status : "<None>";
                errorMsg += "\nResponse data: " + error.response ? Utils.prettyPrintJson(JSON.stringify(error.response.data)) : "<None>";
                Utils.logError(errorMsg);

                reject(errorMsg);
            });
        });
    }

    

    public createSparkpostIntegrationFolder(
      req: express.Request,
      res: express.Response
    ) {
      // this.getRefreshTokenHelper(this._accessToken, res);
      console.log("createSparkpostIntegrationFolder:" + req.body.memberid);
      console.log("createSparkpostIntegrationFolder:" + req.body.soapInstance);
      console.log("createSparkpostIntegrationFolder:" + req.body.refreshToken);
      console.log("createSparkpostIntegrationFolder:" + req.body.ParentFolderID);
  
      let refreshTokenbody = "";
      //this.getRefreshTokenHelper(this._accessToken, res);
      // this.getRefreshTokenHelper(req.body.refreshToken, req.body.tssd, false, res)
       
      let oauthToken=req.body.accessToken;
     
          let createFolderData =
          '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
          "<soapenv:Header>" +
          "<fueloauth>" +
           oauthToken +
          "</fueloauth>" +
          "</soapenv:Header>" +
          "<soapenv:Body>" +
          '<CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
          "<Options/>" +
          '<ns1:Objects xmlns:ns1="http://exacttarget.com/wsdl/partnerAPI" xsi:type="ns1:DataFolder">' +
          '<ns1:ModifiedDate xsi:nil="true"/>' +
          '<ns1:ObjectID xsi:nil="true"/>' +
          "<ns1:CustomerKey>mcapp44 - " +
           this.member_id +
          "</ns1:CustomerKey>" +
          "<ns1:ParentFolder>" +
          '<ns1:ModifiedDate xsi:nil="true"/>' +
          "<ns1:ID> 12785" +
           
          "</ns1:ID>" +
          '<ns1:ObjectID xsi:nil="true"/>' +
          "</ns1:ParentFolder>" +
          "<ns1:Name>mcapp44 - " +
          this.member_id +
          "</ns1:Name>" +
          "<ns1:Description>Smcapp44- " +
          this.member_id +
          " Folder</ns1:Description>" +
          "<ns1:ContentType>dataextension</ns1:ContentType>" +
          "<ns1:IsActive>true</ns1:IsActive>" +
          "<ns1:IsEditable>true</ns1:IsEditable>" +
          "<ns1:AllowChildren>true</ns1:AllowChildren>" +
          "</ns1:Objects>" +
          "</CreateRequest>" +
          "</soapenv:Body>" +
          "</soapenv:Envelope>";
  
          return new Promise<any>((resolve, reject) => {
            let headers = {
              "Content-Type": "text/xml",
              SOAPAction: "Create",
            };
  
            // POST to Marketing Cloud Data Extension endpoint to load sample data in the POST body
            axios({
              method: "post",
              url: "" + this.soap_instance_url + "Service.asmx" + "",
              data: createFolderData,
              headers: headers,
            })
              .then((response: any) => {
                let sendresponse = {};
  
                var parser = new xml2js.Parser();
                parser.parseString(
                  response.data,
                  (
                    err: any,
                    result: {
                      [x: string]: {
                        [x: string]: { [x: string]: { [x: string]: any }[] }[];
                      };
                    }
                  ) => {
                    let SparkpostIntegrationsID =
                      result["soap:Envelope"]["soap:Body"][0][
                      "CreateResponse"
                      ][0]["Results"][0]["NewID"][0];
                    if (SparkpostIntegrationsID != undefined) {
                      //  this.FolderID = SparkpostIntegrationsID;
  
                      sendresponse = {
                        refreshToken: refreshTokenbody,
                        statusText: true,
                        soap_instance_url: req.body.soapInstance,
                        member_id: req.body.memberid,
                        FolderID: SparkpostIntegrationsID,
                      };
                      res.status(200).send(sendresponse);
                    } else {
                      sendresponse = {
                        refreshToken: refreshTokenbody,
                        statusText: false,
                        soap_instance_url: req.body.soapInstance,
                        member_id: req.body.memberid,
                        FolderID: SparkpostIntegrationsID,
                      };
                      res.status(200).send(sendresponse);
                    }
                  }
                  
                );
              })
              .catch((error: any) => {
                // error
                let errorMsg =
                  "Error creating the Sparkpost Integrations folder......";
                errorMsg += "\nMessage: " + error.message;
                errorMsg +=
                  "\nStatus: " + error.response
                    ? error.response.status
                    : "<None>";
                errorMsg +=
                  "\nResponse data: " + error.response.data
                    ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                    : "<None>";
                Utils.logError(errorMsg);
  
                reject(errorMsg);
              });
          });
        
        // .catch((error: any) => {
        //   res
        //     .status(500)
        //     .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
        // });
    } 
    public creatingDomainConfigurationDE(
    req: express.Request,
    res: express.Response,
  
    ) : Promise<any> {
      return new Promise<any>((resolve, reject) => {
        console.log('dename'+req.body.dataextensionname);
    //this.getRefreshTokenHelper(this._accessToken, res);
    console.log("creatingDomainConfigurationDE:" + this.member_id);
    console.log("creatingDomainConfigurationDE:" + this.soap_instance_url);
       //console.log('domainConfigurationDECheck:'+req.body.ParentFolderID);
   
       this.getOAuthAccessToken(this.client_id, this.client_secret)
      .then((response) => {       
        Utils.logInfo(
          "creatingDomainConfigurationDE:" + JSON.stringify(response.oauthAccessToken)
               );
        
        let DCmsg =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
        "    <s:Header>" +
        '        <a:Action s:mustUnderstand="1">Create</a:Action>' +
        '        <a:To s:mustUnderstand="1">' +
        this.soap_instance_url +
        "Service.asmx" +
        "</a:To>" +
        '        <fueloauth xmlns="http://exacttarget.com">' +
        response.oauthAccessToken +
        "</fueloauth>" +
        "    </s:Header>" +
        '    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">' +
        '        <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">' +
        '            <Objects xsi:type="DataExtension">' +
        "                <CategoryID>24086" +
        
        "</CategoryID>" +
        "                <CustomerKey>" +req.body.dataextensionname+
        this.member_id +
        "</CustomerKey>" +
        "                <Name>" +req.body.dataextensionname+
        this.member_id +
        "</Name>" +
        "                <Fields>" +
        "                    <Field>" +
        "                        <CustomerKey>Domain ID</CustomerKey>" +
        "                        <Name>Domain ID</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>50</MaxLength>" +
        "                        <IsRequired>true</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Domain Name</CustomerKey>" +
        "                        <Name>Domain Name</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>100</MaxLength>" +
        "                        <IsRequired>true</IsRequired>" +
        "                        <IsPrimaryKey>true</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Inbox Threshold</CustomerKey>" +
        "                        <Name>Inbox Threshold</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>100</MaxLength>" +
        "                        <IsRequired>false</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Engagement Threshold</CustomerKey>" +
        "                        <Name>Engagement Threshold</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>100</MaxLength>" +
        "                        <IsRequired>false</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>SPF Threshold</CustomerKey>" +
        "                        <Name>SPF Threshold</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>100</MaxLength>" +
        "                        <IsRequired>false</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>DKIM Threshold</CustomerKey>" +
        "                        <Name>DKIM Threshold</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>100</MaxLength>" +
        "                        <IsRequired>false</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Campaign Min</CustomerKey>" +
        "                        <Name>Campaign Min</Name>" +
        "                        <FieldType>Decimal</FieldType>" +
        "                        <Precision>18</Precision>" +
        "                          <Scale>0</Scale>" +
        "                        <IsRequired>false</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Intelliseed Lists</CustomerKey>" +
        "                        <Name>Intelliseed Lists</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>250</MaxLength>" +
        "                        <IsRequired>false</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Threshold Recipe</CustomerKey>" +
        "                        <Name>Threshold Recipe</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>250</MaxLength>" +
        "                        <IsRequired>false</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Rules Recipe</CustomerKey>" +
        "                        <Name>Rules Recipe</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <MaxLength>250</MaxLength>" +
        "                        <IsRequired>false</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Created or Modified by</CustomerKey>" +
        "                        <Name>Created or Modified by</Name>" +
        "                        <FieldType>Text</FieldType>" +
        "                        <IsRequired>true</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                    <Field>" +
        "                        <CustomerKey>Created or Modified date</CustomerKey>" +
        "                        <Name>Created or Modified date</Name>" +
        "                        <FieldType>Date</FieldType>" +
        "						  <DefaultValue>getdate()</DefaultValue>" +
        "                        <IsRequired>true</IsRequired>" +
        "                        <IsPrimaryKey>false</IsPrimaryKey>" +
        "                    </Field>" +
        "                </Fields>" +
        "            </Objects>" +
        "        </CreateRequest>" +
        "    </s:Body>" +
        "</s:Envelope>";

        
          let headers = {
            "Content-Type": "text/xml",
          };

          axios({
            method: "post",
            url: "" + this.soap_instance_url + "Service.asmx" + "",
            data: DCmsg,
            headers: headers,
          })
            .then((response: any) => {
             console.log("hello");
             
             
               console.log("response-",response);
                
                 resolve(
                  {
                      statusText: response.data
                  });
            })
            .catch((error: any) => {
              // error
              let errorMsg =
                "Error creating the Domain Configuration Data extension......";
              errorMsg += "\nMessage: " + error.message;
              errorMsg +=
                "\nStatus: " + error.response
                  ? error.response.status
                  : "<None>";
              errorMsg +=
                "\nResponse data: " + error.response.data
                  ? Utils.prettyPrintJson(JSON.stringify(error.response.data))
                  : "<None>";
              Utils.logError(errorMsg);

              reject(errorMsg);
            });
        
      })
      .catch((error: any) => {
        res
          .status(500)
          .send(Utils.prettyPrintJson(JSON.stringify(error.response.data)));
      });
  });
    
  
      

}
}    

