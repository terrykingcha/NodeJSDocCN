# 缓冲器类

    稳定性： 3 - 稳定

纯粹的JavaScript语言对处理Unicode非常友好，但却对二进制数据束手无策。在处理TCP流或文件系统时，
不得不操作字节流。Node拥有操作、创建以及消耗字节流等的一系列策略。

原始数据储存在`缓冲器`类的实例中。`缓冲区`像是一个整型数组，只不过是在V8堆外分配的一个原始内存块。
`缓冲区`是不能改变大小的。

`缓冲器`类是全局对象，必须使用`require('buffer')`的情况非常少见。

在缓冲流和JavaScript字符串对象之间转换，需要显式提供编码方法。如下列举了不同的字符编码。

* `'ascii'` - 仅用于7位的ASCII数据。这种编码方法非常快速，并且一旦设置便会抛弃高位数据。
  注意，这个编码方式会将空字符（`'\0'` 或 `'\u0000'`）转换成`0x20`（空格的字符编码）。
  如果想把空字符转换成`0x00`，得使用`'utf8'`。

* `'utf8'` - 多字节编码的Unicode字符。许多网页以及其它文档格式会使用UTF-8编码。

* `'ucs2'` - 仅用2个字节编码的Unicode字符。它仅可对BMP（基本多文种平面或第零平面，从U+0000到U+FFFF）进行编码。

* `'base64'` - Base64字符串编码。

* `'binary'` - 经使用每个字符的头8位把原始二进制数据编码成字符串的一种途径。这是一个已经被废弃的编码方法。
  且为了能让`缓冲器`对象取代这个编码方法，应避免使用它。在Node的未来版本中也会移除掉这个编码方法。

* `'hex'` - 把每个字节编码成两个十六进制字符。

## 类： Buffer

Buffer类是一个全局类型，可以直接处理二进制数据。它有多个构造函数。

### new Buffer(size)

* `size` Number

分配一个拥有`size`字节的新缓冲器。

### new Buffer(array)

* `array` Array

分配一个使用`array`字节序列的新缓冲器。

### new Buffer(str, [encoding])

* `str` String - 需要编码的字符串
* `encoding` String - 使用的编码方式，可选

分配一个包含给定`str`的新缓冲器。`encoding`默认为`'utf8'`。

### buf.write(string, [offset], [length], [encoding])

* `string` String - 写入缓冲区的字符串
* `offset` Number，可选，默认为0
* `length` Number，可选
* `encoding` String，可选，默认为'utf8'

用给定的编码在`offset`偏移处写入`string`到缓冲器中。`offset`默认为`0`，`encoding`默认为`'utf-8'`。
`length`是需要写入的字节数。方法返回成功写入的字节数。如果`缓冲器`没有足够的空间来转载整个字符串，将会
写入一个不完整的字符串。`length`默认为`buffer.length - offset`。这个方法不会写入不完整的字符。


    buf = new Buffer(256);
    len = buf.write('\u00bd + \u00bc = \u00be', 0);
    console.log(len + " bytes: " + buf.toString('utf8', 0, len));

`Buffer._charsWritten`会被设置为写入的字符数（有可能和写入的字节数不同）。
且在下一次调用`buf.write()`时重新覆盖这个值。


### buf.toString([encoding], [start], [end])

* `encoding` String，可选，默认为'utf8'
* `start` Number，可选，默认为0
* `end` Number，可选

从`encoding`编码（默认为`'utf8'`）的缓冲器数据中，截取以`start`（默认为`0`）开始、
`end`（默认为`buffer.length`）结束的数据，将其解码并返回一个字符串。

见上面的`buffer.write()`示例


### buf[index]

<!--type=property-->
<!--name=[index]-->

获取和设置位于`index`的字节值。这个值指向单个字节，所以合法的范围是从`0x00`到`0xFF`或`0`到`255`。

例如，复制一个ASCII字符串到缓冲器中，每次一个字节：

    str = "node.js";
    buf = new Buffer(str.length);

    for (var i = 0; i < str.length ; i++) {
      buf[i] = str.charCodeAt(i);
    }

    console.log(buf.toString()); //（译者注：原文这里有误，直接输出buf对象的结果应该是"<Buffer 6e 6f 64 65 2e 6a 73>"）。

    // node.js

### 类方法：Buffer.isBuffer(obj)

* `obj` Object
* Return: Boolean

验证`obj`是否是个`Buffer`实例。

### 类方法：Buffer.byteLength(string, [encoding])

* `string` String
* `encoding` String，可选，默认为'utf8'
* Return: Number

给出一个字符串确切字节长度。`encoding`默认为`'utf8'`。因为`Strting.prototype.length`返回的是
一个字符串的*字符*个数，所以这两者是有区别的。

示例：

    str = '\u00bd + \u00bc = \u00be';

    console.log(str + ": " + str.length + " characters, " +
      Buffer.byteLength(str, 'utf8') + " bytes");

    // ½ + ¼ = ¾: 9 characters, 12 bytes

### buf.length

* Number

缓冲器的字节大小。注意，这并非是内容所占的大小。`length`是指缓冲器对象的预分配内存大小。
它不会随着内容的改变而改变。


    buf = new Buffer(1234);

    console.log(buf.length);
    buf.write("some string", "ascii", 0);
    console.log(buf.length);

    // 1234
    // 1234

### buf.copy(targetBuffer, [targetStart], [sourceStart], [sourceEnd])

* `targetBuffer` Buffer object - 做为复制目标的缓冲器
* `targetStart` Number，可选，默认为0
* `sourceStart` Number，可选，默认为0
* `sourceEnd` Number，可选，默认为0

在缓冲器之间进行复制。源和目标的区间是可以重叠的。`targetStart`和`sourceStart`默认为`0`。
`sourceEnd`默认为`buffer.length`。

示例：构建两个缓冲器，然后把`buf1`从第16到第19个字节复制到第8个字节开始的`buf2`中。

    buf1 = new Buffer(26);
    buf2 = new Buffer(26);

    for (var i = 0 ; i < 26 ; i++) {
      buf1[i] = i + 97; // 97 is ASCII a
      buf2[i] = 33; // ASCII !
    }

    buf1.copy(buf2, 8, 16, 20);
    console.log(buf2.toString('ascii', 0, 25));

    // !!!!!!!!qrst!!!!!!!!!!!!!


### buf.slice([start], [end])

* `start` Number，可选，默认为0
* `end` Number，可选，默认为0

返回一个新缓冲器，它引用的内存就是原缓冲器从`start`（默认为`0`）到`end`（默认为`buffer.length`）的索引区间。

**改变新缓冲器片段同样会改变原缓冲器中相对应的那块内存！**

示例：用ASCII字母表构建一个缓冲器，获取一个新缓冲器片段，然后改变原缓冲器的一个字节。

    var buf1 = new Buffer(26);

    for (var i = 0 ; i < 26 ; i++) {
      buf1[i] = i + 97; // 97 is ASCII a
    }

    var buf2 = buf1.slice(0, 3);
    console.log(buf2.toString('ascii', 0, buf2.length));
    buf1[0] = 33;
    console.log(buf2.toString('ascii', 0, buf2.length));

    // abc
    // !bc

### buf.readUInt8(offset, [noAssert])

* `offset` Number
* `noAssert` Boolean，可选，默认为false
* Return: Number

从缓冲器的指定偏移处读取一个无符号8位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`offset`可以超出缓冲器的末尾。默认为`false`。

示例：

    var buf = new Buffer(4);

    buf[0] = 0x3;
    buf[1] = 0x4;
    buf[2] = 0x23;
    buf[3] = 0x42;

    for (ii = 0; ii < buf.length; ii++) {
      console.log(buf.readUInt8(ii));
    }

    // 0x3
    // 0x4
    // 0x23
    // 0x42

### buf.readUInt16LE(offset, [noAssert])
### buf.readUInt16BE(offset, [noAssert])

* `offset` Number
* `noAssert` Boolean，可选，默认为false
* Return: Number

以不同的字节顺序从缓冲器的指定偏移处读取一个无符号16位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`offset`可以超出缓冲器的末尾。默认为`false`。

示例：

    var buf = new Buffer(4);

    buf[0] = 0x3;
    buf[1] = 0x4;
    buf[2] = 0x23;
    buf[3] = 0x42;

    console.log(buf.readUInt16BE(0));
    console.log(buf.readUInt16LE(0));
    console.log(buf.readUInt16BE(1));
    console.log(buf.readUInt16LE(1));
    console.log(buf.readUInt16BE(2));
    console.log(buf.readUInt16LE(2));

    // 0x0304
    // 0x0403
    // 0x0423
    // 0x2304
    // 0x2342
    // 0x4223

### buf.readUInt32LE(offset, [noAssert])
### buf.readUInt32BE(offset, [noAssert])

* `offset` Number
* `noAssert` Boolean，可选，默认为false
* Return: Number

以不同的字节顺序从缓冲器的指定偏移处读取一个无符号32位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`offset`可以超出缓冲器的末尾。默认为`false`。

示例：

    var buf = new Buffer(4);

    buf[0] = 0x3;
    buf[1] = 0x4;
    buf[2] = 0x23;
    buf[3] = 0x42;

    console.log(buf.readUInt32BE(0));
    console.log(buf.readUInt32LE(0));

    // 0x03042342
    // 0x42230403

### buf.readInt8(offset, [noAssert])

* `offset` Number
* `noAssert` Boolean，可选，默认为false
* Return: Number

从缓冲器的指定偏移处读取一个有符号8位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`offset`可以超出缓冲器的末尾。默认为`false`。

同`buffer.readUInt8`相比，除了两者的结果被当作成对的有符号补码外，其它都一样。

### buf.readInt16LE(offset, [noAssert])
### buf.readInt16BE(offset, [noAssert])

* `offset` Number
* `noAssert` Boolean，可选，默认为false
* Return: Number

以不同的字节顺序从缓冲器的指定偏移处读取一个有符号16位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`offset`可以超出缓冲器的末尾。默认为`false`。

同`buffer.readUInt16*`相比，除了两者的结果被当作成对的有符号补码外，其它都一样。

### buf.readInt32LE(offset, [noAssert])
### buf.readInt32BE(offset, [noAssert])

* `offset` Number
* `noAssert` Boolean，可选，默认为false
* Return: Number

以不同的字节顺序从缓冲器的指定偏移处读取一个有符号32位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`offset`可以超出缓冲器的末尾。默认为`false`。

同`buffer.readUInt32*`相比，除了两者的结果被当作成对的有符号补码外，其它都一样。

### buf.readFloatLE(offset, [noAssert])
### buf.readFloatBE(offset, [noAssert])

* `offset` Number
* `noAssert` Boolean，可选，默认为false
* Return: Number

以不同的字节顺序从缓冲器的指定偏移处读取一个32位浮点型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`offset`可以超出缓冲器的末尾。默认为`false`。

示例：

    var buf = new Buffer(4);

    buf[0] = 0x00;
    buf[1] = 0x00;
    buf[2] = 0x80;
    buf[3] = 0x3f;

    console.log(buf.readFloatLE(0));

    // 0x01

### buf.readDoubleLE(offset, [noAssert])
### buf.readDoubleBE(offset, [noAssert])

* `offset` Number
* `noAssert` Boolean，可选，默认为false
* Return: Number

以不同的字节顺序从缓冲器的指定偏移处读取一个64位双精度型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`offset`可以超出缓冲器的末尾。默认为`false`。

示例：

    var buf = new Buffer(8);

    buf[0] = 0x55;
    buf[1] = 0x55;
    buf[2] = 0x55;
    buf[3] = 0x55;
    buf[4] = 0x55;
    buf[5] = 0x55;
    buf[6] = 0xd5;
    buf[7] = 0x3f;

    console.log(buf.readDoubleLE(0));

    // 0.3333333333333333

### buf.writeUInt8(value, offset, [noAssert])

* `value` Number
* `offset` Number
* `noAssert` Boolean，可选，默认为false

在缓冲器的指定偏移处写入一个`value`。注意，`value`必须是一个有效的无符号8位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`value`可能对该函数来说太大了，
`offset`可能超出缓冲器的末尾，这些都会导致值在不知道的情况下被丢弃（译者注：即不会抛错）。
在并不能确保正确的情况下，最好不要设置为true。默认为`false`。

示例：

    var buf = new Buffer(4);
    buf.writeUInt8(0x3, 0);
    buf.writeUInt8(0x4, 1);
    buf.writeUInt8(0x23, 2);
    buf.writeUInt8(0x42, 3);

    console.log(buf);

    // <Buffer 03 04 23 42>

### buf.writeUInt16LE(value, offset, [noAssert])
### buf.writeUInt16BE(value, offset, [noAssert])

* `value` Number
* `offset` Number
* `noAssert` Boolean，可选，默认为false

以不同的字节顺序在缓冲器的指定偏移处写入一个`value`。注意，`value`必须是一个有效的无符号16位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`value`可能对该函数来说太大了，
`offset`可能超出缓冲器的末尾，这些都会导致值在不知道的情况下被丢弃（译者注：即不会抛错）。
在并不能确保正确的情况下，最好不要设置为true。默认为`false`。

示例：

    var buf = new Buffer(4);
    buf.writeUInt16BE(0xdead, 0);
    buf.writeUInt16BE(0xbeef, 2);

    console.log(buf);

    buf.writeUInt16LE(0xdead, 0);
    buf.writeUInt16LE(0xbeef, 2);

    console.log(buf);

    // <Buffer de ad be ef>
    // <Buffer ad de ef be>

### buf.writeUInt32LE(value, offset, [noAssert])
### buf.writeUInt32BE(value, offset, [noAssert])

* `value` Number
* `offset` Number
* `noAssert` Boolean，可选，默认为false

以不同的字节顺序在缓冲器的指定偏移处写入一个`value`。注意，`value`必须是一个有效的无符号32位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`value`可能对该函数来说太大了，
`offset`可能超出缓冲器的末尾，这些都会导致值在不知道的情况下被丢弃（译者注：即不会抛错）。
在并不能确保正确的情况下，最好不要设置为true。默认为`false`。

示例：

    var buf = new Buffer(4);
    buf.writeUInt32BE(0xfeedface, 0);

    console.log(buf);

    buf.writeUInt32LE(0xfeedface, 0);

    console.log(buf);

    // <Buffer fe ed fa ce>
    // <Buffer ce fa ed fe>

### buf.writeInt8(value, offset, [noAssert])

* `value` Number
* `offset` Number
* `noAssert` Boolean，可选，默认为false

在缓冲器的指定偏移处写入一个`value`。注意，`value`必须是一个有效的有符号8位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`value`可能对该函数来说太大了，
`offset`可能超出缓冲器的末尾，这些都会导致值在不知道的情况下被丢弃（译者注：即不会抛错）。
在并不能确保正确的情况下，最好不要设置为true。默认为`false`。

同`buffer.writeUInt8`相比，除了两者写入`缓冲器`的值被当作成对的有符号整型补码外，其它都一样。

### buf.writeInt16LE(value, offset, [noAssert])
### buf.writeInt16BE(value, offset, [noAssert])

* `value` Number
* `offset` Number
* `noAssert` Boolean，可选，默认为false

以不同的字节顺序在缓冲器的指定偏移处写入一个`value`。注意，`value`必须是一个有效的有符号16位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`value`可能对该函数来说太大了，
`offset`可能超出缓冲器的末尾，这些都会导致值在不知道的情况下被丢弃（译者注：即不会抛错）。
在并不能确保正确的情况下，最好不要设置为true。默认为`false`。

同`buffer.writeUInt16*`相比，除了两者写入`缓冲器`的值被当作成对的有符号整型补码外，其它都一样。

### buf.writeInt32LE(value, offset, [noAssert])
### buf.writeInt32BE(value, offset, [noAssert])

* `value` Number
* `offset` Number
* `noAssert` Boolean，可选，默认为false

以不同的字节顺序在缓冲器的指定偏移处写入一个`value`。注意，`value`必须是一个有效的有符号32位整型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`value`可能对该函数来说太大了，
`offset`可能超出缓冲器的末尾，这些都会导致值在不知道的情况下被丢弃（译者注：即不会抛错）。
在并不能确保正确的情况下，最好不要设置为true。默认为`false`。

同`buffer.writeUInt32*`相比，除了两者写入`缓冲器`的值被当作成对的有符号整型补码外，其它都一样。

### buf.writeFloatLE(value, offset, [noAssert])
### buf.writeFloatBE(value, offset, [noAssert])

* `value` Number
* `offset` Number
* `noAssert` Boolean，可选，默认为false

以不同的字节顺序在缓冲器的指定偏移处写入一个`value`。注意，`value`必须是一个有效的32位浮点型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`value`可能对该函数来说太大了，
`offset`可能超出缓冲器的末尾，这些都会导致值在不知道的情况下被丢弃（译者注：即不会抛错）。
在并不能确保正确的情况下，最好不要设置为true。默认为`false`。

示例：

    var buf = new Buffer(4);
    buf.writeFloatBE(0xcafebabe, 0);

    console.log(buf);

    buf.writeFloatLE(0xcafebabe, 0);

    console.log(buf);

    // <Buffer 4f 4a fe bb>
    // <Buffer bb fe 4a 4f>

### buf.writeDoubleLE(value, offset, [noAssert])
### buf.writeDoubleBE(value, offset, [noAssert])

* `value` Number
* `offset` Number
* `noAssert` Boolean，可选，默认为false

以不同的字节顺序在缓冲器的指定偏移处写入一个`value`。注意，`value`必须是一个有效的64位双精度型。

把`noAssert`设置为true，就会略过对`offset`的验证。也就说`value`可能对该函数来说太大了，
`offset`可能超出缓冲器的末尾，这些都会导致值在不知道的情况下被丢弃（译者注：即不会抛错）。
在并不能确保正确的情况下，最好不要设置为true。默认为`false`。

示例：

    var buf = new Buffer(8);
    buf.writeDoubleBE(0xdeadbeefcafebabe, 0);

    console.log(buf);

    buf.writeDoubleLE(0xdeadbeefcafebabe, 0);

    console.log(buf);

    // <Buffer 43 eb d5 b7 dd f9 5f d7>
    // <Buffer d7 5f f9 dd b7 d5 eb 43>

### buf.fill(value, [offset], [end])

* `value`
* `offset` Number，可选
* `end` Number，可选

用给定的值填充缓冲器。如果没有给出`offset`（默认为`0`）和`end`（默认为`buffer.length`），那么会填充整个缓冲器。

    var b = new Buffer(50);
    b.fill("h");

## buffer.INSPECT_MAX_BYTES

* Number，默认为50

指明当调用`buffer.inspect()`允许返回的字节数。它可以被用户模块重载。

注意，这个属性只存在于用`require('buffer')`返回的缓冲器模块中，不存在于全局的缓冲器类或缓冲器实例中。

## 类：SlowBuffer

这个类主要在内部使用。JavaScript程序必须使用Buffer来代替SlowBuffer。

在服务器生命周期内，为了避免给众多小块内存分配C++缓冲器对象的开销，Node会以8Kb（8192字节）为单元分配内存。
如果一个缓冲器小于这个单元，那么会返回一个SlowBuffer对象。如果大于这个单元，那么Node会直接为其分配一个SlowBuffer片（Slab）。
（译者注：即可以有效减少碎片的产生）。
