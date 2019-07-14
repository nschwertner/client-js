/* global fhir */
const EventEmitter  = require("events");
const MemoryStorage = require("./MemoryStorage");
const Location      = require("./Location");
const Adapter       = require("../../src/adapters/BrowserAdapter").Adapter;

class BrowserEnvironment extends EventEmitter
{
    constructor(options)
    {
        super();
        this.options = {
            replaceBrowserHistory: true,
            fullSessionStorageSupport: true,
            ...options
        };
        this._location = new Location("http://localhost");
    }

    get fhir()
    {
        // @ts-ignore
        return typeof fhir === "function" ? fhir : null;
    }

    getUrl()
    {
        return new URL(this._location.href);
    }

    redirect(to)
    {
        this._location.href = to;
        this.emit("redirect");
    }

    getStorage()
    {
        if (!this._storage) {
            this._storage = new MemoryStorage();
        }
        return this._storage;
    }

    relative(url)
    {
        return new URL(url, this._location.href).href;
    }

    async loadUrl(...args)
    {
        // this.redirect(url);
        return Adapter.prototype.loadUrl.apply(this, args);
    }
}

module.exports = BrowserEnvironment;
