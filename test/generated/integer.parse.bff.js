module.exports = function (parsers) {
    parsers.bff.object = function () {
    }


    parsers.bff._inc = function (buffer, start, end, stack) {
        var parser = new parsers.inc.object
        return 1
    }

    parsers.bff.object.prototype.parse = function (buffer, start, end) {
        this.start = start

        var object

        object = {
            integer: null
        }

        if (end - start < 2) {
            var parser = new parsers.inc.object
            return parser.parse(buffer, this.start, end)
        }

        object.integer =
            buffer[start++] * 0x100 +
            buffer[start++]

        return { start: start, object: object, parser: null }
    }
}
