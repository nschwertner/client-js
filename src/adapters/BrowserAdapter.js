/* global fhir */
const BrowserStorage = require("../storage/BrowserStorage");
const BaseAdapter    = require("./BaseAdapter");

// #!debug
const debug = require("../lib").debug;

/**
 * Browser Adapter
 * @type {fhirclient.Adapter}
 */
class BrowserAdapter extends BaseAdapter
{
    /**
     * In browsers we need to be able to (dynamically) check if fhir.js is
     * included in the page. If it is, it should have created a "fhir" variable
     * in the global scope.
     */
    get fhir()
    {
        // @ts-ignore
        return typeof fhir === "function" ? fhir : null;
    }

    /**
     * Given the current environment, this method must return the current url
     * as URL instance
     * @returns {URL}
     */
    getUrl()
    {
        if (!this._url) {
            this._url = new URL(location + "");
        }
        return this._url;
    }

    /**
     * Given the current environment, this method must redirect to the given
     * path
     * @param {String} to The path to redirect to
     * @returns {void}
     */
    redirect(to)
    {
        location.href = to;
    }

    /**
     * Returns a BrowserStorage object which is just a wrapper around
     * sessionStorage
     * @returns {BrowserStorage}
     */
    getStorage()
    {
        if (!this._storage) {
            this._storage = new BrowserStorage();
        }
        return this._storage;
    }

    /**
     * Loads the @url into specific browsing context (new tab or window, iframe,
     * popup...).
     * @param {String} url
     * @param {Object} [options]
     * @param {fhirclient.AuthTarget | (() => fhirclient.AuthTarget) | (() => Promise<fhirclient.AuthTarget>)} [options.target]
     * @param {number} [options.width]
     * @param {number} [options.height]
     * @returns {Promise<Window>}
     */
    async loadUrl(url, options = {})
    {
        let { target = "_self", width = 800, height = 720 } = options;

        // The target can be a function that returns the target. This can be
        // used to open a layer pop-up with an iframe and then return a reference
        // to that iframe (or its name)
        if (typeof target == "function") {
            target = await target();
        }

        // The target can be a window reference
        if (target && typeof target == "object") {
            try {
                target.location.assign(url);
                return target;
            } catch (e) {
                // #!debug
                debug("Cannot load url into the specified target. Failing back to '_self'.");
                target = "_self";
            }
        }

        // At this point target must be a string
        if (typeof target != "string") {
            // #!debug
            debug("Invalid target type '%s'. Failing back to '_self'.", typeof target);
            target = "_self";
        }

        // New tab or window
        if (target == "_blank") {
            try {
                target = window.open(url);
                return target;
            } catch (e) {
                // #!debug
                debug("Cannot open new tab or window. Failing back to '_self'.");
                target = "_self";
            }
        }

        // Load in the parent frame
        if (target == "_parent") {
            try {
                parent.location.assign(url);
                return parent;
            } catch (e) {
                // #!debug
                debug("Cannot modify parent location. Failing back to '_self'.");
                target = "_self";
            }
        }

        // Load in the full body of the window
        if (target == "_top") {
            try {
                top.location.assign(url);
                return top;
            } catch (e) {
                // #!debug
                debug("Cannot modify top location. Failing back to '_self'.");
                target = "_self";
            }
        }

        // Popup window
        if (target == "popup") {
            let win = self.open(url, "smartAuthPopup", [
                "height=" + height,
                "width=" + width,
                "menubar=0",
                "resizable=1",
                "status=0",
                "top=" + (screen.height - height) / 2,
                "left=" + (screen.width - width) / 2
            ].join(","));

            if (!win) {
                // #!debug
                debug("Cannot open a popup window. Failing back to '_self'.");
                target = "_self";
            } else {
                return win;
            }
        }

        // Frame or window by name
        if (frames[target]) {
            try {
                frames[target].location.assign(url);
                return frames[target];
            } catch(e) {
                // #!debug
                debug("Cannot load url into the specified target. Failing back to '_self'.");
                target = "_self";
            }
        }

        // Finally load into the current window
        if (target == "_self") {
            self.location.assign(url);
            return self;
        }

        throw new Error(`Unknown target ${target}`);
    }

    static smart(options)
    {
        return new BrowserAdapter(options).getSmartApi();
    }
}

module.exports = BrowserAdapter.smart;
module.exports.Adapter = BrowserAdapter;
