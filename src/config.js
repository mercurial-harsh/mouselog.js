import urljoin from 'url-join';
import * as debug from './debugger';

class Config {
    // Set up a default config
    constructor() {
        // Type: string, REQUIRED
        // Endpoint Url
        this.uploadEndpoint = "http://localhost:9000";

        // Type: string
        // Website ID
        this.websiteId = "unknown";

        // Endpoint type, "absolute" or "relative"
        this.endpointType = "absolute";

        // Upload mode, "mixed", "periodic" or "event-triggered"
        this.uploadMode = "mixed";

        // Type: number
        // If `uploadMode` is "mixed", "periodic", data will be uploaded every `uploadPeriod` ms.
        // If no data are collected in a period, no data will be uploaded
        this.uploadPeriod = 5000;

        // Type: number
        // If `uploadMode` == "event-triggered"
        // The website interaction data will be uploaded when every `frequency` events are captured.
        this.frequency = 50;

        // Type: bool
        // Use GET method to upload data? (stringified data will be embedded in URI)
        this.enableGet = false;

        // Type: number
        // Time interval for resending the failed trace data
        this.resendInterval = 3000;

        // Type: HTML DOM Element
        // Capture the events occur in `this.scope`
        this.scope = window.document;

        // These parameters are required for runing a Mouselog agent
        this._requiredParams = [
            "uploadEndpoint",
        ];

        // These parameters will be ignored when updating config
        this._ignoredParams = [
            "scope",
        ];
    }

    build(config, isUpdating = false) {
        try {
            this._requiredParams.forEach(key => {
                if (!Object.prototype.hasOwnProperty.call(config, key)) {
                    throw new Error(`Param ${key} is required but not declared.`);
                }
            });
            // Overwrite the default config
            Object.keys(config).forEach( key => {
                // Overwriting Class private members / function method is not allowed
                if (this[key] !== undefined && !key.startsWith("_") && typeof(this[key]) != "function") {
                    // Do not update some `ignored` parameter
                    if (!(isUpdating && key in this._ignoredParams)) {
                        this[key] = config[key];
                    }
                }
            });
            this._formatUrl();
        } catch(err) {
            debug.write(err);
            return false;
        }
        return true;
    }

    update(config) {
        return this.build(config, true);
    }

    _formatUrl() {
        if (this.endpointType == "relative") {
            this.absoluteUrl = urljoin(window.location.origin, this.uploadEndpoint);
        } else if (this.endpointType == "absolute") {
            this.absoluteUrl = urljoin(this.uploadEndpoint, "/api/upload-trace");
        } else {
            throw new Error('`endpointType` can only be "absolute" or "relative"');
        }
    }
}
export default Config;
