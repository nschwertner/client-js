const EventEmitter  = require("events");

class History
{
    constructor(location)
    {
        this._location = location;
    }

    replaceState(a, b, loc)
    {
        this._location.href = loc;
    }
}

class Location extends EventEmitter
{
    constructor(href = "")
    {
        super();
        this._href = href;
    }

    get href()
    {
        return this._href;
    }

    set href(value)
    {
        this._href = value;
        this.emit("change", value);
    }

    assign(href)
    {
        this.href = href;
    }
}

class Window extends EventEmitter
{
    constructor()
    {
        super();

        this.location = new Location();
        this.history = new History(this.location);

        this.frames = {};
        this.parent = null;
        this.top = this;
        this.self = this;
        this.opener = null;

        this.FHIR = {
            // client: (...args) => new Client(env, ...args),
            oauth2: {
                settings: {
                    replaceBrowserHistory: true,
                    fullSessionStorageSupport: true
                },
                // ready: (...args) => smart.ready(env, ...args),
                // authorize: (...args) => smart.authorize(env, ...args)
                // $lab:coverage:on$
            }
        };
    }

    atob(str)
    {
        return Buffer.from(str, "base64").toString("ascii");
    }

    addEventListener(event, handler)
    {
        this.on(event, handler);
    }

    postMessage(event)
    {
        this.emit("message", event);
    }
}

module.exports = Window;