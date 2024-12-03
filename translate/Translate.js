import {v2} from '@google-cloud/translate';
import {ISO639} from './languagecodes.js';
import config from "config";

export default class Translate {


    constructor() {

        const token = config.get('translate').token;
        this.project = config.get("project");

        this.translator = new v2.Translate({
            projectId: this.project,
            key: token
        });
    }


    detectLanguage(text) {
        return new Promise((resolve, reject) => {
            this.translator.detect(text).then(result => {
                let [detections] = result;
                resolve(Array.isArray(detections) ? detections : [detections]);
            }).catch(err => reject);
        });
    }

    translateMessage(text, language) {
        return new Promise((resolve, reject) => {
            this.translator.translate(text, language).then(result => {
                resolve(Array.isArray(result) ? result[0] : text);
            }).catch(err => reject);
        });
    }
}