import config from 'config';
import Translate from '../translate/Translate.js';
import Detector from "./Detector.js";

export default class Conversation {

    constructor(dialogFlowClient, openAIClient) {
        this.dataFlowClient = dialogFlowClient;
        this.openAIClient = openAIClient;
        this.modelLanguage = config.get('dialogFlow').languageCode;
        this.translator = new Translate();
        this.detector = new Detector(this.translator);
    }

   askOrAnswer (client, message) {

        const me = this;
        const session = client.data.session;

        const response = {  success: true, from: 'message', session };

        if (session) {

            this.detector.detect(message, client).then(language => {

                this.translateTo(message, client, true).then (message => {

                    this.dataFlowClient.sendQuery(session, message).then(async queryResult => {
                        const parameters = queryResult.parameters
                        client.data.parameters = parameters;

                        if (parameters && parameters.fields && parameters.fields.end_session) {
                            response.sessionExpired = true;
                            client.emit('session_expired', response);
                        }

                        if (queryResult.payload.answer) {

                            const openAImessage = `Formuleer dit antwoord op '${queryResult.payload.answer}' op deze vraag '${message}'`;
                            me.openAIClient.sendQuery(client.data.history, openAImessage).then(async queryResult => {
                                response.body = this.wrapHyperlinks(await this.translateResponseMessages(queryResult.messages, client).catch(ex => {
                                    this.errorHandler(ex, client);
                                }));
                                client.data.history = queryResult.history;
                                client.emit('message', response);
                            }).catch(ex => {
                                this.errorHandler(ex, client);
                            });

                        } else {
                            response.body = this.wrapHyperlinks(await this.translateResponseMessages(queryResult.messages, client).catch(ex => {
                                this.errorHandler(ex, client);
                            }));
                            client.emit('message', response);
                        }

                    }).catch(ex => {
                        this.errorHandler(ex, client);
                    });

                }).catch(ex => {
                    this.errorHandler(ex, client);
                });
            });
        } else {
            this.translateResponseMessages(["De sessie is verlopen."]).then(messages => {
                response.body = messages;
                client.emit('session_expired', response);
            });
        }
    }

    errorHandler (err, client) {
        const response = {};
        response.success = false;
        console.log(err);

        this.translateTo('Er is een fout opgetreden', client, false).then (message => {
            response.error = message;
            client.emit('message', response);
        }).catch(ex => {
            response.error = 'Er is een fout opgetreden bij het vertalen.';
            client.emit('message', response);
        });
    }

    async translateTo (message, client, toModel) {

        if (client.data.language === this.modelLanguage) {
            return message;
        } else {

            return await this.translator.translateMessage(message, toModel ? this.modelLanguage : client.data.language).catch(ex => {
                this.errorHandler(ex.client);
            });
        }
    }

    async translateResponseMessages (messages, client){
        if (client.data.language === this.modelLanguage) {
            return messages;
        } else {

            const translated = [];

            for (let i = 0; i < messages.length; i++) {
                const translation  = await this.translateTo(messages[i], client, false).catch(ex => {
                    this.errorHandler(ex.client);
                });

                translated.push(translation);
            }

            return translated;
        }
    }

    wrapHyperlinks(messages) {
        const urlRegex = /(\b(?:https?:\/\/|www\.)\S+\b)/g;

        for (let i = 0; i < messages.length; i++) {
            messages[i] = messages[i].replace(urlRegex, function(url) {
                if (url.startsWith('www.')) {
                    url = 'https://' + url;
                }
                return '<a href="' + url + '" target="_blank">' + url + '</a>';
            });
        }

        return messages;
    }
}