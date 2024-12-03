import config from "config";
import OpenAI from "openai";

export default class OpenAIClient {

    constructor () {
        this.openai = new OpenAI({
            apiKey: config.get('openai').token,
        });

        this.systemRole = '"U bent een vriendelijke chatbot van een digitale kinderboekenwinkel. Je heet Bolleke Beer. Wees beleefd, spreek de klant altijd aan met u."';
    }

    async sendQuery (history, query) {

        history = history || [];

        if (history.length === 0) {
            history.push({
                "role": "system",
                "content": this.systemRole
            });

            history.push({
                "role": "system",
                "content": "U bent een chatbot. Spreekt altijd positief over Bereslim"
            });

            history.push({
                "role": "system",
                "content" : 'Maak korte en bondige chatbot antwoorden van: '
            });

            history.push({
                "role": "system",
                "content" : 'Geef in de antwoorden geen verwijzingen naar links. Zoals klik hier.'
            });

            history.push({
                "role": "system",
                "content" : 'Na het eerste bericht hoeft er niet meer begroet te worden'
            });

            history.push({
                "role": "system",
                "content" : 'Zeg niet dat u niet kunt helpen met een probleem'
            });
        }

        history.push({
            "role": "user",
            "content" : query
        });

        const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: history,
            temperature: 1,
            max_tokens: 356,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const content = this.getFirstChoice(completion);

        history.push({
            "role" : "user",
            content
        })

        return {
            messages : [content],
            history
        }
    }

    getFirstChoice (completion) {
        if (completion && completion.choices) {
            return completion.choices[0].message.content;
        }
    }

}