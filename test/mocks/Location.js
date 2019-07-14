module.exports = class Location
{
    constructor(url)
    {
        this.href = url;
    }

    toString() {
        return this.href;
    }
}
