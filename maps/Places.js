import axios from "axios";
import config from "config";

export default class Places {

    constructor () {
        this.searchUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
        this.detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json";
        this.token = config.get('places').token;
    }

    search (text) {

        const me = this;

        return new Promise(function (resolve, reject) {
            axios.get(me.searchUrl, {
                params: {
                    input: text,
                    components: "country:nl|country:be",
                    language: "nl",
                    key: me.token
                }
            }).then(function (response) {
                if (response.status === 200) {
                    let address_search_status = 'not_found';
                    const data = response.data;
                    if (data.status === "OK") {
                        const placeId = data.predictions[0].place_id;
                        if (placeId) {
                            me.details(placeId).then(response => {
                                if (response.status === 200) {
                                    const data = response.data;
                                    if (data.status === "OK") {
                                        const components = me.parseAddressComponents(data.result.address_components);
                                        resolve({ ...components, full_address: data.result.formatted_address, address_search_status: 'found' });
                                    } else {
                                        resolve( { address_search_status: 'service_error' });
                                    }
                                } else {
                                    resolve( { address_search_status: 'service_error' });
                                }
                            }).catch(err => {
                                resolve( { address_search_status: 'service_error' });
                            });
                        } else {
                            resolve( { address_search_status });
                        }
                    } else {
                        resolve( { address_search_status });
                    }
                } else {
                    resolve( { address_search_status: 'service_error' });
                }
            }).catch(err => {
                resolve( { address_search_status: 'service_error' });
            });
        });
    }

    details(id) {
        return axios.get(this.detailsUrl, {
            params: {
                place_id: id,
                fields: "address_components,adr_address,formatted_address",
                language: "nl",
                key: this.token
            }
        });
    }

    parseAddressComponents (components) {

        const result = {};

        if (components && components.length) {

            for (let i = 0; i < components.length; i++) {
                const component = components[i];

                if (component.types.includes('street_number')) {
                    result.house_number = component.long_name;
                }

                if (component.types.includes('route')) {
                    result.street_name = component.long_name;
                }

                if (component.types.includes('postal_code')) {
                    result.postal_code = component.long_name;
                }

                if (component.types.includes('locality')) {
                    result.city = component.long_name;
                }

                if (component.types.includes('country')) {
                    result.country = component.long_name;
                }
            }
        }

        return result;
    }
}