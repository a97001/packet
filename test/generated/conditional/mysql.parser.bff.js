module.exports = function (parsers) {
    const $Buffer = Buffer

    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $sip = []

            const object = {
                value: 0
            }

            if ($end - $start < 1) {
                return parsers.inc.object(object, 1, $sip)($buffer, $start, $end)
            }

            $sip[0] = ($buffer[$start++])

            if ((sip => sip < 251)($sip[0], object)) {
                object.value = (sip => sip)($sip[0])
            } else if ((sip => sip == 0xfc)($sip[0], object)) {
                if ($end - $start < 2) {
                    return parsers.inc.object(object, 5, $sip)($buffer, $start, $end)
                }

                object.value =
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            } else {
                if ($end - $start < 3) {
                    return parsers.inc.object(object, 7, $sip)($buffer, $start, $end)
                }

                object.value =
                    ($buffer[$start++]) * 0x10000 +
                    ($buffer[$start++]) * 0x100 +
                    ($buffer[$start++])
            }

            return { start: $start, object: object, parse: null }
        }
    }
}
