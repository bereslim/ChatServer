import express from 'express';
import config from "config";
import Places from "../maps/Places.js";


const router = express.Router();

const dialogFlow = config.get('dialogFlow');

const getToken = (token) => {
    if (token) {
        return token.includes(dialogFlow.webhook.token);
    }

    return false;
}

router.post('/address', async function(req, res, next) {

    if (getToken(req.headers.authorization)) {

        const p = new Places();

        const sessionInfo = req.body.sessionInfo;
        const session = sessionInfo.session;
        const parameters = sessionInfo.parameters;

        if (parameters.street && parameters.zipcode) {

            try {

                const address = await p.search(`${parameters.street}, ${parameters.zipcode}`);
                const jsonResponse = {
                    fulfillmentResponse: {
                        messages: [
                            {
                                text: {
                                    //fulfillment text response to be sent to the agent
                                    text: [`Ik heb het adres gevonden: ${address.full_address}`]
                                },
                            },
                        ],
                    },
                    sessionInfo: {
                        session: session,
                        parameters: address
                    }

                };
                res.json(jsonResponse);
            } catch (exx) {
                res.status(403).json({"error": "Validation error"});
            }

        } else {
            res.status(403).json({"error": "Validation error"});
        }
    }
});

export default router;