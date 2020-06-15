## Mon Jun 15 02:19:56 CDT 2020

I'd added an issue to create string constants that would be added to packets to
indicate the packet type determined at parse, but don't see a need for it. With
mapped translations, we can turn a flag into a string, and sips that are used to
determine the length of a variable length integer, or otherwise the binary type
of a an integer, as in UTF-8 or MySQL integers, do not convey information that
is useful to the parse. Plus, what do you do during serialization?

https://github.com/bigeasy/packet/issues/9

## Thu Apr 30 01:08:34 CDT 2020 ~ todo

Terminated arrays peek for a terminator, but if the array is an array of words
and the terminator is the same length as element being read, we can read read
the terminator as a word and break when the word equals the word value of
terminator.

Furthermore, if the array is an array of bytes, we can use `Buffer.indexOf` to
look for the terminator.

Implies that we ought to return `Buffer` when the value is an array of bytes.

Note that I'm not in favor of fixups in code at the moment, the user and
pre-process before serialization and post-process after parse.

## Wed Apr 29 08:34:26 CDT 2020

At some point I'm going to have to determine if there is a requirement to have a
user namespace outside of the field names, like for temporary variables. As it
stands, all variables are prefixed with `$`.

## Thu Feb 20 23:42:09 CST 2020

Going to page this project into memory and attempt to leave a roadmap in this
diary entry as I do.

- [x] Length-encoded arrays containing length-encoded arrays.
- [x] Conditionals.
- [ ] Conditional packing.
- [ ] Nested conditionals.
- [x] Packed integers.
- [x] Two's compliment.
- [ ] Checkums.
- [x] Terminated arrays.
- [ ] Fixed arrays.
- [ ] Terminated fixed arrays.
- [ ] BigInt.
- [ ] Floating point.

That was the general order of things and would allow me to run through and
delete the rest of the legacy which I'm still keeping around because there may
be some things I need to swipe.

Remember that his is much easier becuase of `let`. You're considering how to use
the namespace of the function wiht sigils. You have rules about nested names.

Remember to optimize last. Someone might be able to write a parser by hand that
is faster than Packet at first, but you'll catch up over time.

The last thing you where thinking is that you wanted to normalize the descent
logic across all the different generators. Some of them have a different concept
for their `dispatch` function.

Also, I know there is confusion about how to do `$sip` and the like, so we need
a special sigil for internals like `_$` as a prefix, which makes for a simple
rule that only causes problems on rare occasions.

Note that at the outset, I'm not going to worry about namespaces in whole
parsers and use the constructed object as the namespace. A place where
performance may be inproved in the future by using local variables.

## Sun Jan 19 04:21:24 CST 2020

```javascript
{
    packet: {
        mysqlInteger: {
            $parse: {
                $sip: 8n,
                $return: [
                    $sip => $sip < 251, $sip => $sip,
                    $sip => $sip == 0xfc, 16n,
                    $sip => $sip == 0xfd, 24n,
                    $sip => $sip == 0xfe, 64n,
                ]
            },
            // Oops, not putting down the flag.
            // TODO ^^^ What?
            $serialize: [
                $_ => $_ < 251n, 8n
                $_ => $_ >= 251n && $_ < 2n ^ 16, 16n
                $_ => $_ >= 2n ^ 16 && $_ < 2n ^ 24, 24n,
                64n
            ]
        },
        utf8: {
            $parse: {
                $sip: 8,
                $return: [
                    $sip => $sip & 0x80 == 0, $sip => $sip,
                    $sip => $sip & 0xe0 == 0xc0, {
                        $sip: $sip => $sip,
                        $first: 8
                        $return: ($sip, $first) => $sip & 0xe0 << 8 + $first & 0xc0
                    }
                ]
            },
            $serialize: [
                $_ => $_ < 0x80, 8,
                $_ => $_ >= 0x80 && < 0x800, [
                    16, $_ => ($_ >>> 6 & 0x1f | 0xc0 << 8) & ($_ & 0x3f)
                ]
            ]
        },
        utf8: [[
            (utf8) => utf8 < 0x80, 8
        ], [
            (utf8) => utf8 >= 0x80 && < 0x800, [
                16, utf8 => (utf8 >>> 6 & 0x1f | 0xc0 << 8) & (utf8 & 0x3f)
            ]
        ]], [{
            sip: 8,
            utf8: [[
                sip => sip & 0x80 == 0, sip => sip
            ], [
                sip => sip & 0xe0 == 0xc0, {
                    sip: sip => sip,
                    first: 8,
                    utf8: (sip, first) => sip & 0xe0 << 8 + first & 0xc0
                }
            ]]
        }, [ 8, [[
            first => first & 0x80 == 0, first => first
        ], [
            first => first & 0xe0 == 0xc0, [ 8, [[
                (first, second) => first & 0xe0 << 8 + second & 0xc0
            ]]]
        ]]],
        string: [ 'mysqlInteger', [ 'utf8' ] ] // sensible chuckle
    }
}
```

And with that, minification of the definitions is not allowed. It would destroy
the information in the functions. Not sure what this means for anyone using
something like Webpack. Not sure I care. Seems like you ought to be able to sort
out your own tools and not minify a particular file, still be able to source it
somehow.

Whew. UTF-8 is a beast. Yes, we have to have separate parse and serialize. Yes,
we have to have some way of referencing parsers stored as functions. Yike, how
are you going to do best-foot-forward parsers with this mess?

With some rules, we could parse the function bodies and convert the logic to
different languages.

This is the point where I look at future of this project and decide it is a
project for a later date. Will probably push through to length-encoded nested
structures and some sort of conditional, but this hill on the horizon, well, it
looks better on the horizon than under foot.

## Sun Jan 12 16:04:33 CST 2020

The differentiation between lookup and nested structures was going to be that a
lookup has multiple values and a nested structure has a single variable. Why
would you lookup when it always maps to a single variable?

As I write, I realize that we could have conditionals always be started with a
function and that could indicate a conditional.

```javascript
{
    packet: {
        header: {
            type: 4,
            name: [ $ => $.header.type, [ 'connect', 'connack' ] ],
            flags: [ $ => $.header.name, {
                connect: [ 4, 0x0 ],
                connack: [ 4, 0x0 ]
            } ]
        }
    }
}
```

Or maybe even...

```javascript
{
    packet: {
        header: {
            type: 4,
            name: [ $ => $.header.type, [{
                name: 'connect',
                value: [ 4, 0x0 ]
            }, {
                name: 'connect',
                value: [ 4, 0x0 ]
            }] ]
        }
    }
}
```

Or both. This way we don't have to document meanings based on variations of
length.

Can't quite fathom how to convert conditionals to C. If I parse things and find
that it is always lookup and never calculation, then the `$.header.type` can be
converted into a package lookup.

## Tue Oct 29 05:09:00 CDT 2019

ES6 block scope variables (aka `let`) are a boon to parser and serializer
generalization. No more hoisting `var`s and you can declare the variables you
need in a block and not have to worry about collisions. Generated code looks
cleaner (perhaps slightly more generated) and the generation code is going to be
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

## Mon Oct 28 09:36:37 CDT 2019

Parsing seven things.

 * MQTT ~
 * DNS ~
 * MySQL ~
 * tar ~
 * Cap'n Proto ~
 * Minecraft ~

What is the last one? WebSockets, but I'm not really interested in that. Leaving
it open and maybe it is WebSockets and maybe by then it is a doodle, but look
for something that has some really ugly properties.

## Sun Oct 27 20:38:43 CDT 2019

This is a library I sketched out many years ago, but I never got around to
completing it. For those of you who where enamoured of the original language,
you'll find that I've departed from it significantly. I've returned to this
project with JavaScript ES6 and I'm syntax bashing a new parser definition
language taking advantage of contemporary features to get more sigils to play
with. Everything is expressed through syntax bashing JavaScript, no more parsing
strings to determine properties of fields.

New language...

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
    littleEndian: ~32,
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
    zeroTerminatedByByte: [[ 16 ], 0x0 ]
    // Carrage-return, newline terminated array of bytes.
    crlfTerminated: [[ 8 ], 0x0d, 0x0a ],
    // Fixed with array of bytes.
    fixed: [[ 8 ], [ 16 ]],
    // Fixed with array of bytes, zero padded. (Essentially zero terminated.)
    fixedZeroed: [[ 8 ], [ 16 ], 0x0 ],
    // Fixed with array of bytes, ASCII space padded.
    fixedSpaced: [[ 8 ], [ 16 ], 0x20 ],
    // CR-LF fillled. Wonder if such a thing exists in the wild?
    fixedCRLF: [[ 8 ], [ 16 ], 0x0d, 0x0a ],
    // Bit-packed 16-bit integer, note that bit-fields are always big-endian.
    flags: {
        temperature: -4,     // two's compliment signed
        height: 8
        running: 1
        resv: 3
    },
    // We can make the entire field little-endian by explicitly specifying.
    flags: [{
        temperature: -4,     // two's compliment signed
        height: 8
        running: 1
        resv: 3
    }, ~16 ],
    // 4-byte IEEE floating point, a C float.
    float: 0.4,
    // 8-byte IEEE floating point, a C double.
    double: 0.8,
    // Literals.
    literal: [ 'fc' ],
    // Skip 30, fill with ASCII spaces? No different from literal.
    skip: [ '20', 30 ],
    // Otherwise. Strings incidate a padding.
    literal: [ 'fc', 16 ],
    skip: [[ '20', 30 ], 16, [ '20', 3 ]],
    // Would want to import encoding and decoding functions.
    fixup: [ value => encode(value), [
        [ [ 8 ], 0x0 ]
    ], value => decode(value) ],
    skipAndFixup: [
        [ '00', 16 ], [
            [ value => encode(value), [
                [ [ 8 ], 0x0 ]
            ], value => decode(value) ]
        ]
i   ]
})
```

That covers most of the definitions from the days of yore.
