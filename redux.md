## Tue Oct 29 05:09:00 CDT 2019

ES6 block scope varaibles (aka `let`) are a boon to parser and serializer
generalization. No more hoisting `var`s and you can declare the variables you
need in a block and not have to worry about collsions. Generated code looks
cleaner (prehaps slightly more generated) and the generation code is going to be
much cleaner.

## Tue Oct 29 02:29:23 CDT 2019

Packet is designed to run on Node.js because the syntax bashing was implemented
in Node.js with Google V8. There may be some aspects of the language that depend
on Google V8, specifically the representation of JavaScript snippets which
depends on the implementation of `Function.prototype.toString()`. It is probably
possible to shim this for other JavaScript engines.

To the best of my knowledge, the remainder of the language is based on
JavaScript as it is specified. If you find yourself starting a port to another
JavaScript engine, please share your build set up, I'd like to follow along.

The rule for JavaScript code snippets shall be: if the function fits in one line
of code, then we will inline it, if not then we will declare the function and
call it, hopefully the JIT compiler will inline it.

## Sun Oct 27 20:38:43 CDT 2019

This is a library I sketched out many years ago, but I never got around to
completing it. For those of you who where enamoured of the orgininal language,
you'll find that I've departed from it significantly. I've returned to this
project with JavaScript ES6 and I'm syntax bashing a new parser definition
langauge taking advantage of contemporary features to get more sigils to play
with. Everything is expressed through syntax bashing JavaScript, no more parsing
strings to determine properties of fields.

New langauge...

```javascript
define({
    first: 16,
 // ^^^^^ field name
    second: 16,
 //         ^^ size in bits, must be multiple of 8
    // smallest representation wihtout packing, 8-bit byte.
    byte: 8,
    // 32-bit integer, unsigned, network byte order aka big-endian.
    integer: 32,
    // For 64-bit integers we can use `BigInt`.
    integer: 64n,
    // 32-bit integer, little-endian for parsing C structs. The tilde sigil is
    // squiggly and we're squiggling the bits around.
    littenEndian: ~32,
    // 16-bit two's compliment signed integer.
    signed: -16,
    // 16-bit two's compliment signed integer, little-endian.
    signedLittleEndian: -~16,
    // The sign and endian sigils also work for `BigInt`.
    longSignedLittleEndian: -~64n,
    // 16-bit length encoded array of 16-bit integers.
    lengthEncoded: [ 16, [ 16 ]],
    // Zero terminated array of 16-bit integers, terminator is 16-bit.
    zeroTerminated: [[ 16 ], 0x0 ],
    // Zero terminated array of 16-bit integers, terminator is 8-bit.
    zeroTerminatedByByte: [[ 16 ], [ 8, 0x0 ] ]
    // Carrage-return, newline terminated array of bytes.
    crlfTerminated: [[ 8 ], 0x0d, 0x0a ],
    // Fixed with array of bytes.
    fixed: [[ 8 ], [ 16 ]],
    // Fixed with array of bytes, left aligned.
    fixedLeft: [[ 8 ], [ -16 ]],
    // Fixed with array of bytes, zero padded.
    fixedZeroed: [[ 8 ], [ 16 ], 0x0 ],
    // Fixed with array of bytes, ASCII space padded.
    fixedSpaced: [[ 8 ], [ 16 ], 0x20 ],
    // Bit-packed 16-bit integer, note that bit-fields are always big-endian.
    flags: [ 16, {
        temperature: -4,     // two's compliment signed
        height: 8
        running: 1
        resv: 3
    } ],
    // 4-byte IEEE floating point, a C float.
    float: 0.4,
    // 8-byte IEEE floating point, a C double.
    double: 0.8
})
```

That covers most of the definitions from the days of yore.
