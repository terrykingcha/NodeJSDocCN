## 进程对象

`process`对象是一个全局对象，可以随时随地访问它。它是`EventEmitter`的一个实例。


### 'exit'事件

`function () {}`

当进程将要退出时会触发该句柄。通常是定时检查模块状态的一个钩子（hook，比如用于单元测试）。
主事件循环，在`exit`回调完成后将终止运行，所以定时器也就不再按计划执行了。

监听`exit`事件的例子：

    process.on('exit', function () {
      process.nextTick(function () {
       console.log('This will not run');
      });
      console.log('About to exit.');
    });

### 'uncaughtException'事件

`function (err) { }`

当异常一直冒泡到事件循环层时触发该句柄。如果给这个异常添加了一个监听器，
那么默认行为（即打印堆栈跟踪并退出）将不再发生。

监听`uncaughtException`事件的例子：

    process.on('uncaughtException', function (err) {
      console.log('Caught exception: ' + err);
    });

    setTimeout(function () {
      console.log('This will still run.');
    }, 500);

    // 故意引发一个异常，但不捕获。
    nonexistentFunc();
    console.log('This will not run.');

注意，`uncaughtException`事件对于异常处理来说是非常简陋的机制。在程序中使用try/catch能更好的控制程序流程。
而对于需要持续运行的服务器程序来说，`uncaughtException`事件是一个有效且安全的机制。

### 信号事件

`function () {}`

当进程接收到一个信号时触发该句柄。可参见sigaction(2)中的标准POSIX信号列表，比如SIGINT，SIGUSR1等等。

监听`SIGINT`信号事件的例子：

    // 等待从标准输入中读取，以保证不退出程序
    process.stdin.resume();

    process.on('SIGINT', function () {
      console.log('Got SIGINT.  Press Control-D to exit.');
    });

在大多数终端程序中，用`Control-C`可以简单的发送`SIGINT`信号。


### process.stdout

指向`标准输出（stdout）`的`可写流`。

定义`console.log`的例子：

    console.log = function (d) {
      process.stdout.write(d + '\n');
    };

在Node中`process.stderr`和`process.stdout`和其它流有区别。在这个流上的写操作通常是阻塞的。
当指向标准文件或TTY文件描述符时，会发生阻塞。而当指向管道时，就像其它流一样不再阻塞了。


### process.stderr

指向`标准错误（stderr）`的可写流。

在Node中`process.stderr`和`process.stdout`和其它流有区别。在这个流上的写操作通常是阻塞的。
当指向标准文件或TTY文件描述符时，会发生阻塞。而当指向管道时，就像其它流一样不再阻塞了。


### process.stdin

指向`标准输入（stdin）`的可读流。标准输入流默认是暂停的，所以必须通过`process.stdin.resume()`
才能从流中读取。

打开标准输入，并同时监听两个事件的例子：

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (chunk) {
      process.stdout.write('data: ' + chunk);
    });

    process.stdin.on('end', function () {
      process.stdout.write('end');
    });


### process.argv

一个包含命令行参数的数组。第一个数组元素是`node`，第二个元素是JavaScript文件的名字。之后的元素
就是附加的命令行参数。

    // 打印 process.argv
    process.argv.forEach(function (val, index, array) {
      console.log(index + ': ' + val);
    });

会输出：

    $ node process-2.js one two=three four
    0: node
    1: /Users/mjr/work/node/process-2.js
    2: one
    3: two=three
    4: four


### process.execPath

这是开启进程的那个可执行文件的绝对路径。

例如:

    /usr/local/bin/node


### process.abort()

这会让Node触发一个中止事件。它会让Node退出，并生成一个核心文件。

### process.chdir(directory)

变更进程的当前工作目录，如果失败则抛出异常。

    console.log('Starting directory: ' + process.cwd());
    try {
      process.chdir('/tmp');
      console.log('New directory: ' + process.cwd());
    }
    catch (err) {
      console.log('chdir: ' + err);
    }



### process.cwd()

返回进程的当前工作目录。

    console.log('Current directory: ' + process.cwd());


### process.env

一个包含用户环境的对象。参见environ(7)。


### process.exit([code])

以指定的`代码（code）`结束进程。如果不指定，退出时将使用表示`成功`的代码`0`。


用表示`失败`的代码来退出的例子：

    process.exit(1);

执行Node的shell就会知道退出代码是1.


### process.getgid()

获得进程的群组标识（参见getgid(2)）。参数是群组的数字id，并不是群组名。

    console.log('Current gid: ' + process.getgid());


### process.setgid(id)

设置进程的群组标识（参见setgid(2)）。参数可以是数字ID，也可以群组名字符串。
如果指定的是群组名，在解析成数字ID的过程中，进程会被阻塞。

    console.log('Current gid: ' + process.getgid());
    try {
      process.setgid(501);
      console.log('New gid: ' + process.getgid());
    }
    catch (err) {
      console.log('Failed to set gid: ' + err);
    }


### process.getuid()

获得进程的用户标识（参见getuid(2)）。参数是用户的数字id，并不是用户名。

    console.log('Current uid: ' + process.getuid());


### process.setuid(id)

设置进程的用户标识（参见setuid(2)）。参数可以是数字ID，也可以用户名字符串。
如果指定的是用户名，在解析成数字ID的过程中，进程会被阻塞。

    console.log('Current uid: ' + process.getuid());
    try {
      process.setuid(501);
      console.log('New uid: ' + process.getuid());
    }
    catch (err) {
      console.log('Failed to set uid: ' + err);
    }


### process.version

一个内建属性，用来显示`Node的版本`（NODE_VERSION）。

    console.log('Version: ' + process.version);

### process.versions

用于显示Node的版本描述字符串，以及它的依赖包。

    console.log(process.versions);

输出：

    { node: '0.4.12',
      v8: '3.1.8.26',
      ares: '1.7.4',
      ev: '4.4',
      openssl: '1.0.0e-fips' }


### process.installPrefix

一个内建属性，用来显示`Node的安装路径前缀`（NODE_PREFIX）。


    console.log('Prefix: ' + process.installPrefix);


### process.kill(pid, [signal])

发送一个信号给某个进程。`pid`是进程id，而`signal`是要发送给进程的信号描述名，例如
'SINGIT'或'SIGUSR1'等。如果省略这个参数，发送信号默认为'SIGTERM'。更多信息，请参见kill(2)。

注意，这个函数的名称正巧是`process.kill`，它仅仅只是一个信号发送器，就像`kill`流程一样。
除了杀死目标进程外，发送信号还可以做一些其它事情。

给自身发送信号的例子：

    process.on('SIGHUP', function () {
      console.log('Got SIGHUP signal.');
    });

    setTimeout(function () {
      console.log('Exiting.');
      process.exit(0);
    }, 100);

    process.kill(process.pid, 'SIGHUP');


### process.pid

进程的PID。

    console.log('This process is pid ' + process.pid);

### process.title

获取或设置在'ps'命令中显示的进程标题。

### process.arch

显示运行进程的硬件架构，例如`'arm'`，`'ia32'`，或 `'x64'`。

    console.log('This processor architecture is ' + process.arch);


### process.platform

显示运行进程的平台信息，例如`'linux2'`，`'darwin'`等。

    console.log('This platform is ' + process.platform);


### process.memoryUsage()

返回一个描述Node进程内存使用量的对象，单位是字节。

    var util = require('util');

    console.log(util.inspect(process.memoryUsage()));

输出：

    { rss: 4935680,
      heapTotal: 1826816,
      heapUsed: 650472 }

`heapTotal`和`heapUsed`指示的是V8内存使用情况。


### process.nextTick(callback)

在事件循环过程中的下一次循环周期内执行回调。这并*不是*`setTimeout（fn, 0）`的别名，实际上它要高效得多。

    process.nextTick(function () {
      console.log('nextTick callback');
    });


### process.umask([mask])

设置或读取进程的文件模式创建掩码（umask）。子进程从父进程那里继承这个掩码。
如果设定了`mask`参数的值，函数会返回旧的掩码，否则返回当前的掩码。

    var oldmask, newmask = 0644;

    oldmask = process.umask(newmask);
    console.log('Changed umask from: ' + oldmask.toString(8) +
                ' to ' + newmask.toString(8));


### process.uptime()

Node已经运行的秒数。
