import { Network } from "./renderer/utilities/Network";

export class ConstellationAttributeLoader {

    static load = (url: string, callback: (success: boolean, vertexes: any[], transactions: any[], graph: any[]) => void): void => {

        Network.get(url, (status, response) => {
            if (status === 200) {
                const json = JSON.parse(response);
                callback(true, json['vertex'], json['transaction'], json['graph']);
            }
            // Added to handle the case when an invalid ID of the graph was requested.
            else if (status === 404) {
                console.log("TODO: status = 404 - Null callback given");
                callback(false, [], [], []);
            }
        });
    }
}