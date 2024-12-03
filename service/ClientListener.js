import Greeter from "./Greeter.js";
import DialogFlowClient from "../dialogflow/DialogFlowClient.js";
import Conversation from "./Conversation.js";
import OpenAIClient from "../openai/OpenAI.js";

export default class ClientListener {

    constructor (io) {

        this.dialogFlowClient = new DialogFlowClient();
        this.openAIClient = new OpenAIClient();

        this.greeter = new Greeter(this.dialogFlowClient, this.openAIClient);
        this.conversation = new Conversation(this.dialogFlowClient, this.openAIClient);

        io.on('connection', this.onConnection.bind(this));
    }

    onConnection (socket) {

        socket.on('greet', message => {
            this.greeter.greet(socket);
        });

        socket.on('message', message => {
            this.conversation.askOrAnswer(socket, message);
        });
    }

}