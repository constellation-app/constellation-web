import { Network } from "./renderer/utilities/Network";

export class ConstellationTableLoader {

    // static load = (url: string, callback: (vertexes: Map<number, any>,
    // transactions: Map<number, any>) => void): void => {
    static load = (url: string, callback: (vertexes: any[], transactions: any[]) => void): void => {

        Network.get(url, (status, response) => {
            if (status === 200) {
                const json = JSON.parse(response);
                callback(json['vertex'][1]['data'], json['transaction'][1]['data']);
            }
            // Added to handle the case when an invalid ID of the graph was requested.
            else if(status === 404) {
                // TODO: Code to clear the buffers when no graph is available. 
                console.log("TODO: status = 404");
                callback([], []);
            }
        });
    }
}