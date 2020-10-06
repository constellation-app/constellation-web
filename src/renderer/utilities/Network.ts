export class Network {

    static get = (url: string, callback: (status: number, response: string) => void): void => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => { 
            if (xmlHttp.readyState === 4) {
                callback(xmlHttp.status, xmlHttp.responseText);
            }
        }
        xmlHttp.open("GET", url, true); // true for asynchronous 
        xmlHttp.send(null);
    }

}