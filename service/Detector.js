import config from 'config';
import {ISO639} from "../translate/languagecodes.js";

export default class Detector {

    constructor(translator) {
        this.translator = translator;
        this.modelLanguage = config.get('dialogFlow').languageCode;
    }

    async detect (message, client) {

        if (!client.data.language) {

            const response = {success: true, from: 'detect'};

            const languages = await this.translator.detectLanguage(message).catch(this.errorHandler);

            if (Array.isArray(languages) && languages.length > 0) {
                const language = languages[0].language
                const isoName = ISO639[language];

                if (isoName) {
                    response.language = language;
                    response.languageName = isoName;
                    client.data.language = language;
                    client.emit('detect', response);
                    return language;
                }
            }

            return this.modelLanguage;

        } else {
            return client.data.language
        }
    }


    errorHandler (err, from, client) {
        const response = {};
        response.success = false;
        response.error = err.message;
        client.emit('detect', response);
    }

}