export default class Greeter {

    constructor(dialogFlowClient, openAIClient) {
        this.dataFlowClient = dialogFlowClient;
        this.openAIClient = openAIClient;

        this.openAIGreetingLine = '"Stel jezelf eenmalig kort voor en zeg dat he de volgende diensten kan leveren: informatie geveb, demo aanmaken voor een kinderopvang-, bieb-, school of logopedie abonnement, paswoord reset doen."';
    }


    greet (client) {

        const me = this;
        const session= this.dataFlowClient.newSession();
        client.data.session = session

        const response = {  success: true, from: 'greet', session };
        this.dataFlowClient.sendQuery(session, 'Goedendag').then(queryResult => {
            client.data.parameters = queryResult.parameters;
            client.data.history = [];
            response.body = queryResult.messages;
            client.emit('message', response);
        }).catch(ex => {
            this.errorHandler(ex, client);
        });
    }

    // greet (client) {
    //
    //     const me = this;
    //     const session= this.dataFlowClient.newSession();
    //     client.data.session = session
    //
    //     const response = {  success: true, from: 'greet', session };
    //     this.openAIClient.sendQuery([], this.openAIGreetingLine).then(queryResult => {
    //         response.body = queryResult.messages;
    //         client.data.history = queryResult.history;
    //         client.emit('message', response);
    //     }).catch(ex => {
    //         this.errorHandler(ex, client);
    //     });
    // }

    errorHandler (err, client) {
        const response = {};
        response.success = false;
        response.error = err.message;
        client.emit('greet', response);
    }

}