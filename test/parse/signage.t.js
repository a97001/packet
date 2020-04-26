require('proof')(48, function (equal) {
    const unsign = require('../../fiddle/unsign')
    function sign (name, bits) {
        if (bits == 32) {
            return `${name} < 0 ? (~Math.abs(${name}) >>> 0) + 1 : ${name}`
        }
        let mask = 0xffffffff, test = 1
        mask = mask >>> (32 - bits)
        return `${name} < 0 ? (~Math.abs(${name}) & 0x${mask.toString(16)}) + 1 : ${name}`
    }
    function iterate (source, label, tests) {
        console.log(`${label}: ${source}`)
        const f = new Function('value', `return ${source}`)
        while (tests.length != 0) {
            const [ from, to ] = tests.splice(0, 2)
            equal(f(from), to, `${label} ${from} -> ${to}`)
        }
    }
    const twos3bit = [
        0x7, -1,
        0x6, -2,
        0x5, -3,
        0x4, -4,
        0x3, 3,
        0x2, 2,
        0x1, 1,
        0x0, 0
    ]
    iterate(unsign('value', 3), '3-bit unsign', twos3bit.slice())
    iterate(sign('value', 3), '3-bit sign', twos3bit.slice().reverse())
    const twos8bit = [
        0xff, -1,
        0xfe, -2,
        0xfd, -3,
        0x80, -128,
        0x7f, 127,
        0x2, 2,
        0x1, 1,
        0x0, 0
    ]
    iterate(unsign('value', 8), '8-bit unsign', twos8bit.slice())
    iterate(sign('value', 8), '8-bit sign', twos8bit.slice().reverse())
    const twos32bit = [
        0xffffffff, -1,
        0xfffffffe, -2,
        0xfffffffd, -3,
        0x80000000, -0x7fffffff - 1,
        0x7fffffff, 0x7fffffff,
        0x2, 2,
        0x1, 1,
        0x0, 0
    ]
    iterate(unsign('value', 32), '32-bit unsign', twos32bit.slice())
    iterate(sign('value', 32), '32-bit sign', twos32bit.slice().reverse())
})
