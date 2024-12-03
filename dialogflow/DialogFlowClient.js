import config from "config";
import { SessionsClient } from "@google-cloud/dialogflow-cx";

export default class DialogFlowClient {

    constructor () {

        this.config = config.get('dialogFlow');

        this.client = new SessionsClient({
            credentials : this.config.keyFile
        });

        this.client.initialize();

    }

    newSession () {
        return Math.random().toString(36).substring(7);
    }

    createSessionPath (session) {
        return this.client.projectLocationAgentSessionPath(
            this.config.projectId,
            this.config.location,
            this.config.agentId,
            session
        );
    }

    createRequest (session, query) {
        const sessionPath = this.createSessionPath(session);

        return {
            session: sessionPath,
            queryInput: {
                text: {
                    text: query
                },
                languageCode: 'nl'
            }
        };
    }

    async sendQuery (session, query) {

        const me = this;
        let [response] = await this.client.detectIntent(this.createRequest(session, query));

        let payload = me.parsePayload(response.queryResult);

        if (payload.question === 'redirect') {
            [response] = await this.client.detectIntent(this.createRequest(session, query));
        }

        payload = me.parsePayload(response.queryResult);

        return {
            messages : me.parseResponseMessages(response.queryResult),
            parameters: response.queryResult.parameters,
            payload
        }
    }

    parseResponseMessages (queryResult) {

        const messages = [];

        if (queryResult && queryResult.responseMessages) {
            queryResult.responseMessages.forEach(message => {
               if (message.text) {
                   if (message.text.text) {
                       messages.push(message.text.text[0] || message.text.text);
                   } else {
                       messages.push(message.text);
                   }

               }
            });
        }

        return messages;
    }

    parsePayload (queryResult) {
        const payload = {};

        if (queryResult && queryResult.responseMessages) {
            queryResult.responseMessages.forEach(message => {
                if (message.payload) {
                    if (message.payload.fields) {
                        const fields = message.payload.fields;
                        Object.keys(fields).forEach(key => {
                            const field = fields[key];
                            payload[key] = field.stringValue;
                        });
                    }
                }
            });
        }

        return payload;
    }


}