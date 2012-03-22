# 加密模块

用`require('crypto')`来访问加密模块。

加密模块需要底层系统提供OpenSSL的支持。它提供了安全证书的封装方式，可以用于HTTPS安全网络或http连接。

该模块还提供了一套针对OpenSSL的哈希（hash），密钥哈希（hmac），加密（cipher），
解密（decipher），签名（sign）以及验证（verify）等方法的封装。

## crypto.createCredentials(details)

创建一个证书对象，可选参数details为一个字典，其键值如下：

* `key`：字符串，以PEM编码的私钥
* `passphrase`：字符串，作为私钥口令
* `cert`：字符串，以PEM编码的证书
* `ca`：字符串或字符串列表，以PEM编码的可信CA证书
* `crl`：字符串或字符串列表，以PEM编码的证书废除列表（CRL）
* `ciphers`：字符串，描述是否使用密文。详情请查阅<http://www.openssl.org/docs/apps/ciphers.html#CIPHER_LIST_FORMAT>

如果没有给出'ca'的细节，那么node会使用默认的公共受信任CA证书列表。
<http://mxr.mozilla.org/mozilla/source/security/nss/lib/ckfw/builtins/certdata.txt>.


## crypto.createHash(algorithm)

创建并返回一个哈希（hash）对象。这是一个指定算法的加密哈希，可用于生成哈希摘要。

`algorithm`依赖于系统安装的OpenSSL版本所支持的算法。例如，`'sha1'`，`'md5'`，`'sha256'`，`'sha512'`等等。
在近期发行的版本中，通过`openssl list-message-digest-algorithms`可以显示可用的摘要算法。

示例：计算一个文件的sha1校验和

    var filename = process.argv[2];
    var crypto = require('crypto');
    var fs = require('fs');

    var shasum = crypto.createHash('sha1');

    var s = fs.ReadStream(filename);
    s.on('data', function(d) {
      shasum.update(d);
    });

    s.on('end', function() {
      var d = shasum.digest('hex');
      console.log(d + '  ' + filename);
    });

## 类：Hash

用于创建数据的哈希摘要。

由`crypto.createHash`返回。

### hash.update(data, [input_encoding])

用`data`更新哈希表，其编码方式由`input_encoding`提供，可以是`'utf8'`，`'ascii'`或`'binary'`。
默认为`'binary'`。
当以流方式提供数据时，可以多次调用该方法。

### hash.digest([encoding])

计算哈希表内已有数据的摘要。`encoding`可以是`'hex'`，`'binary'`或`'base64'`。默认为`'binary'`。

注意：在调用`digest()`方法后，`hash`对象不再可用。

## crypto.createHmac(algorithm, key)

创建并返回一个密钥哈希（hmac）对象。这是一个指定算法和密钥的加密密钥哈希。

`algorithm`依赖于系统安装的OpenSSL版本所支持的算法 - 参见上述的createHash。
`key`是用于密钥哈希的密钥。


## 类：Hmac

用于创建加密的密钥哈希。

由`crypto.createHmac`返回。

### hmac.update(data)

用`data`更新密钥哈希表。
当以流方式提供数据时，可以多次调用该方法。

### hmac.digest([encoding])

计算密钥哈希表内已有数据的摘要。`encoding`可以是`'hex'`，`'binary'`或`'base64'`。默认为`'binary'`。

注意：在调用`digest()`方法后，`hmac`对象不再可用。

## crypto.createCipher(algorithm, password)

用指定的算法和口令，创建并返回一个加密（cipher）对象。

`algorithm`依赖于OpenSSL，例如`'aes192'`等。在近期发行的版本中，通过`openssl list-cipher-algorithms` 
可以显示可用的加密算法。`password`用来派生出密钥和初始化向量（IV），它必须是`'binary'`编码的字符串
（请参见[缓冲器章节](buffer_cn.html)获取更多信息）。

## crypto.createCipheriv(algorithm, key, iv)

用指定的算法、密钥以及初始化向量（IV），创建并返回一个加密（cipher）对象。

`algorithm`与`createCipher()`中的相同。`key`是用在算法中的原始密钥。`iv`是一个初始化向量。
`key` and `iv`必须是二进制编码的字符串（请参见[缓冲器章节](buffer_cn.html)获取更多信息）。

## Class: Cipher

用于加密数据。

由`crypto.createCipher`和`crypto.createCipheriv`返回。

### cipher.update(data, [input_encoding], [output_encoding])

用`data`更新加密对象，其编码方式由`input_encoding`提供，可以是`'utf8'`，`'ascii'`或`'binary'`。
默认为`'binary'`。

`output_encoding`指定了加密后数据的输出格式，可以是`'binary'`，`'base64'`或`'hex'`。默认为`'binary'`。

它会返回加密后的内容，且当以流方式提供数据时，可以多次调用该方法。

### cipher.final([output_encoding])

返回剩余的加密数据，`output_encoding`可以是`'binary'`，`'base64'`或`'hex'`。默认为`'binary'`。

注意：`cipher`对象在调用`final()`方法后不再可用。

### cipher.setAutoPadding(auto_padding=true)

可以禁用对输入数据进行自动补齐成块大小的功能。如果`auto_padding`设置为false，整个输入的数据必须是加密块大小的整数倍，
否则`final`方法会失败。这样就可以用非标准的补齐方式，比如`0x0`来代替PKCS补齐方式。而且必须在调用`cipher.final`前执行。

## crypto.createDecipher(algorithm, password)

用指定的算法和口令，创建并返回一个解密（decipher）对象。
这和上述的[createCipher()](#crypto.createCipher) 刚好是对称的。

## crypto.createDecipheriv(algorithm, key, iv)

用指定的算法、密钥以及初始化向量（IV），创建并返回一个解密（decipher）对象。
这和上述的[createCipheriv()](#crypto.createCipheriv) 刚好是对称的。

## Class: Decipher

用于解密数据。

由`crypto.createDecipher`和`crypto.createDecipheriv`返回。

### decipher.update(data, [input_encoding], [output_encoding])

用`data`更新解密对象，其编码方式由`input_encoding`提供，可以是`'utf8'`，`'ascii'`或`'binary'`。
默认为`'binary'`。

`output_encoding`指定了解密后文本的输出格式，可以是`'binary'`，`'ascii'`或`'utf8'`。默认为`'binary'`。

### decipher.final([output_encoding])

返回剩余的解密文本，`output_encoding`可以是`'binary'`，`'ascii'`或`'utf8'`。默认为`'binary'`。

注意：`decipher`对象在调用`final()`方法后不再可用。

### decipher.setAutoPadding(auto_padding=true)

如果为了避免`decipher.final`检查未采用标准块补齐的解密数据而移除它的话，可以禁用自动补齐功能。只有在输入数据的长度是加密块大小整数倍的时候才能起作用。且必须在`decipher.update`获得流数据之前调用这个方法。

## crypto.createSign(algorithm)

用指定的算法，创建并发挥一个签名（sign）对象。
在近期发行的版本中，通过`openssl list-public-key-algorithms`` 
可以显示可用的签名算法。例如`'RSA-SHA256'`。

## Class: Signer

用于生成签名。

由`crypto.createSign`返回。

### signer.update(data)

用`data`更新签名对象。当以流方式提供数据时，可以多次调用该方法。

### signer.sign(private_key, [output_format])

为所有在签名对象中已更新完毕的数据的计算签名。
`private_key`是一个以PEM编码用于签名私钥的字符串。

返回签名，可以用`output_format`来规定格式，其值为`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

注意：`signer`对象在调用`sign()`方法后不再可用。

## crypto.createVerify(algorithm)

用指定的算法，创建并返回一个验证对象。
这和上述的签名对象刚好是对称的。

## Class: Verify

用于验证签名。

由`crypto.createVerify`返回。

### verifier.update(data)

用`data`更新验证对象。当以流方式提供数据时，可以多次调用该方法。

### verifier.verify(object, signature, [signature_format])

用`object`和`signature`验证签名数据。`object`是一个包含PEM编码对象的字符串，其可以是RSA公钥，DSA公钥或者X.509证书。`signature`是早先对数据进行计算过的签名，其格式`signature_format`可以是`'binary'`，`'hex'`或`'base64'`。默认是`'binary'`，

返回ture还是false取决于数据和公钥的签名有效性。

注意：`verifier`对象在调用`verfiy`方法后不再可用。

## crypto.createDiffieHellman(prime_length)

创建一个Diffie-Hellman密钥交换对象，并生成一个成给定位长的素数。该生成器使用的是`2`。

## crypto.createDiffieHellman(prime, [encoding])

用提供的素数，创建一个Diffie-Hellman密钥交换对象。该生成器使用的是`2`。编码可以是`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

## Class: DiffieHellman

用于创建Diffie-Hellman密钥交换。

由`crypto.createDiffieHellman`。

### diffieHellman.generateKeys([encoding])

生成Diffie-Hellman的私钥和公钥值，并返回用指定的编码返回公钥。这个密钥须转交于另一方使用。编码可以是`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

### diffieHellman.computeSecret(other_public_key, [input_encoding], [output_encoding])

把作为另一方公钥的`other_public_key`用于计算共享密钥，并返回这个共享密钥。提供的公钥用指定的`input_encoding`编码，而密钥用指定的`output_encoding`编码。编码可以是`'binary'`，`'hex'`或`'base64'`。输入的编码默认为`'binary'`。如果没有给出输出的编码，那么就那输入的编码来使用。

### diffieHellman.getPrime([encoding])

以指定的编码返回Diffie-Hellman素数，编码可以是`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

### diffieHellman.getGenerator([encoding])

以指定的编码返回Diffie-Hellman生成器（译者注：原文这里还是prime，应该是作者Ctrl-C/Ctrl-v后的笔误……），编码可以是`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

### diffieHellman.getPublicKey([encoding])

以指定的编码返回Diffie-Hellman公钥，编码可以是`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

### diffieHellman.getPrivateKey([encoding])

以指定的编码返回Diffie-Hellman私钥，编码可以是`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

### diffieHellman.setPublicKey(public_key, [encoding])

设置Diffie-Hellman的公钥。公钥的编码可以是`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

### diffieHellman.setPrivateKey(public_key, [encoding])

设置Diffie-Hellman的私钥。私钥的编码可以是`'binary'`，`'hex'`或`'base64'`。默认为`'binary'`。

## crypto.getDiffieHellman(group_name)

创建一个预定义的Diffie-Hellman密钥交换对象。可提供的组为：`'modp1'`，`'modp2'`，`'modp5'`
(定义于[RFC 2412](http://www.rfc-editor.org/rfc/rfc2412.txt ))和`'modp14'`，`'modp15'`，`'modp16'`，`'modp17'`，`'modp18'`
(定于与[RFC 3526](http://www.rfc-editor.org/rfc/rfc3526.txt ))。
返回的对象模拟了由上述[crypto.createDiffieHellman()](#crypto.createDiffieHellman)创建的对象接口，但并不允许改变密钥（比如用[diffieHellman.setPublicKey()](#diffieHellman.setPublicKey) ）。
用这个程序的好处是不需要预先生成多方也不需要改变组模块，可以同时节省处理和通讯的时间。

获取一个共享私钥的例子：

    var crypto = require('crypto');
    var alice = crypto.getDiffieHellman('modp5');
    var bob = crypto.getDiffieHellman('modp5');

    alice.generateKeys();
    bob.generateKeys();

    var alice_secret = alice.computeSecret(bob.getPublicKey(), 'binary', 'hex');
    var bob_secret = bob.computeSecret(alice.getPublicKey(), 'binary', 'hex');

    /* alice_secret and bob_secret should be the same */
    console.log(alice_secret == bob_secret);

## crypto.pbkdf2(password, salt, iterations, keylen, callback)

异步的PBKDF2提供了伪随机函数HMAC-SHA1来获得指定长度的密钥，这个密钥来自于指定的password，salt和iterations。
回调获得两个参数`(err, derivedKey)`。

## crypto.randomBytes(size, [callback])

生成加密的强伪随机数据。使用方法：

    // async
    crypto.randomBytes(256, function(ex, buf) {
      if (ex) throw ex;
      console.log('Have %d bytes of random data: %s', buf.length, buf);
    });

    // sync
    try {
      var buf = crypto.randomBytes(256);
      console.log('Have %d bytes of random data: %s', buf.length, buf);
    } catch (ex) {
      // handle error
    }
