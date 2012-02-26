## 模块

Node采用一个简单的模块加载系统。在Node中，文件和模块是一一对应的。
下面的例子展示了`foo.js`文件如何在相同的目录中加载`circle.js`模块。

`foo.js`的内容为：

    var circle = require('./circle.js');
    console.log( 'The area of a circle of radius 4 is '
               + circle.area(4));

`circle.js`的内容为：

    var PI = Math.PI;

    exports.area = function (r) {
      return PI * r * r;
    };

    exports.circumference = function (r) {
      return 2 * PI * r;
    };

`circle.js`模块导出了`area()`和`circumference()`两个方法。导出一个对象的要领，
就是把它添加到`exports`这个专设的对象中去。

模块的本地变量是私有的。在上面的例子中，变量`PI`就是`circle.js`私有的。

### 循环嵌套

当一个模块存在`require()`的循环调用时，它会在完成执行前就返回出去了。

思考以下这种情况

`a.js`:

    console.log('a starting');
    exports.done = false;
    var b = require('./b.js');
    console.log('in a, b.done = %j', b.done);
    exports.done = true;
    console.log('a done');

`b.js`:

    console.log('b starting');
    exports.done = false;
    var a = require('./a.js');
    console.log('in b, a.done = %j', a.done);
    exports.done = true;
    console.log('b done');

`main.js`:

    console.log('main starting');
    var a = require('./a.js');
    var b = require('./b.js');
    console.log('in main, a.done=%j, b.done=%j', a.done, b.done);

When `main.js` loads `a.js`, then `a.js` in turn loads `b.js`.  At that
point, `b.js` tries to load `a.js`.  In order to prevent an infinite
loop an **unfinished copy** of the `a.js` exports object is returned to the
`b.js` module.  `b.js` then finishes loading, and its exports object is
provided to the `a.js` module.
在`main.js`加载`a.js`过程中，`a.js`又加载`b.js`。此时此刻，`b.js`会试图再去加载`a.js`。
为了避免引起无限循环，`a.js`中需导出的对象转换成一个**不完整的副本**，返回给`b.js`模块。
然后`b.js`就完成了加载的工作，并把自身要导出对象提供给`a.js`模块。

此时，`main.js`就完成了两个模块的加载，所有的都尘埃落定。
这个程序的输出将会是这样的：

    $ node main.js
    main starting
    a starting
    b starting
    in b, a.done = false
    b done
    in a, b.done = true
    a done
    in main, a.done=true, b.done=true

如果在你的程序中有循环依赖的模块，请确保按照如上的方式来设计它们。

### 核心模块

node中有一些编译成二进制的模块。在此后的文档中会对其进行详细的阐述。

核心模块的node源码位于`lib/`文件夹中。

当诸如'http'这样的标识被传递给`require()`时，其指定的核心模块，
在这里也就是内建的HTTP模块，会被优先加载并返回，即使有同名文件存在也会如此。

### 文件模块

如果找不到确切的文件名，node会为其添加`.js`，`.json`或者`.node`等扩展名，再尝试加载这些文件。

`.js`文件会以JavaScript文本文件的方式来解释执行，而`.json`文件会以JSON文本文件的方式来解析。`.node`文件
的解释过程，就如同用`dlopen`加载已编译的插件(addon)模块那样。

以`'/'`为前缀的模块指向的文件是一个绝对路径，例如`require('/home/marco/foo.js')`会加载文件`/home/marco/foo.js`。

以`'./'`为前缀的模块所指向文件的路径，则相对于调用`require()`命令的文件。
也就是说为了让`require('./circle')`能正确加载文件，`circle.js`必须同`foo.js` 在同一个目录下。

当不使用'/' or './'来指定一个文件时，该模块或是核心模块，或是从某个`node_modules`文件夹中被加载的模块。

如果给定的路径不存在，`require()`会抛出一个错误，该错误的`code`属性会设置成`'MODULE_NOT_FOUND'`。

### 从`node_modules`文件夹加载

如果传递给`require()`的标识不是一个原生模块，并且也不是以 `'/'`, `'../'`, or `'./'`的文件名。
那么，node将从当前模块的父目录开始，在其`/node_modules`子目录中尝试加载。

如果还是没有找到，则转移到再上一级目录，依此类推。直到达到根目录为止。

举个例子，如果在文件`'/home/ry/projects/foo.js'`中调用`require('bar.js')`命令，
node将会依此查找以下位置：

* `/home/ry/projects/node_modules/bar.js`
* `/home/ry/node_modules/bar.js`
* `/home/node_modules/bar.js`
* `/node_modules/bar.js`

这使得程序可以各自处理依赖关系，因而不发生冲突。

### 目录模块化

目录模块化便于组织程序和库，把代码集中在自身所处的目录中，并提供单一的入口来指向这个库。
共有三种方式可以将一个目录当作参数传递给`require()`。

首先，可以在目录的根下创建一个`package.json`文件，它指定了一个`main`模块。
以下是package.json文件的一个例子：

    { "name" : "some-library",
      "main" : "./lib/some-library.js" }

如果它位于`./some-library`目录下，那么`require('./some-library')`会尝试去加载`./some-library/lib/some-library.js`

这就是package.json文件在node中所起到的作用。

如果没有package.json文件，那么node将试图在目录中加载`index.js` 或 `index.node`文件。
比如，上述例子中没有package.json这个文件，那么`require('./some-library')`将试图加载：

* `./some-library/index.js`
* `./some-library/index.node`

### 缓存

模块在第一次加载后，就被缓存了。这意味着（在其他地方）每次调用`require('foo')`时，如确定是同一个文件，都会准确的
返回相同对象。

多次调用 `require('foo')`并不会使模块代码被多次执行。这是一个非常重要的特性。依此，"部分完成"
的对象能够被返回出去，从而即使它们之间存在循环调用，也能让传递性依赖顺利被加载。

如果你希望一个模块多次执行其代码，那么把它导出为一个函数，并调用这个函数。

#### 模块缓存的注意项

模块是基于解析过后的文件名来进行缓存的。随着调用它的模块所处位置不同，
被解析模块会拥有不同的文件名。既然文件名不同，也就不能保证`require('foo')`始终返回同一个对象。

### 模块的exports对象（module.exports）

`exports`是有模块系统创建的。有时候并不期望如此，很多情况下想把类的实例当作一个模块。
于是，就需要把期望导出的对象赋值给`module.exports`.例如，假设正在创建一个名为`a.js`的模块：

    var EventEmitter = require('events').EventEmitter;

    module.exports = new EventEmitter();

    // 先完成一些任务，然后发出一个命令
    // 模块自己的`ready`事件
    setTimeout(function() {
      module.exports.emit('ready');
    }, 1000);

接着在另外一个文件中，就可以：

    var a = require('./a');
    a.on('ready', function() {
      console.log('module a is ready');
    });

注意，对`module.exports`的赋值必须第一时间完成。不能在回调函数里进行赋值。
以下的做法就起不到任何作用：

x.js:

    setTimeout(function() {
      module.exports = { a: "hello" };
    }, 0);

y.js:

    var x = require('./x');
    console.log(x.a);


### 模块的require方法（module.require）

`module.require`方法提供了类似于从原始模块中调用`require()`的一种模块加载方式。

Note that in order to do this, you must get a reference to the `module`
object.  Since `require()` returns the `exports`, and the `module` is
typically *only* available within a specific module's code, it must be
explicitly exported in order to be used.
注意，为了使用require方法，必须先获得对`module`对象的引用。在`require()`返回`exports`之后，


### 总结一下...

可使用`require.resolve()`函数，获得调用`require()`时将加载的确切文件名。

综上所述，这里以伪代码的形式给出require.resolve的算法逻辑：

    require(X) from module at path Y
    1. If X is a core module,
       a. return the core module
       b. STOP
    2. If X begins with './' or '/' or '../'
       a. LOAD_AS_FILE(Y + X)
       b. LOAD_AS_DIRECTORY(Y + X)
    3. LOAD_NODE_MODULES(X, dirname(Y))
    4. THROW "not found"

    LOAD_AS_FILE(X)
    1. If X is a file, load X as JavaScript text.  STOP
    2. If X.js is a file, load X.js as JavaScript text.  STOP
    3. If X.node is a file, load X.node as binary addon.  STOP

    LOAD_AS_DIRECTORY(X)
    1. If X/package.json is a file,
       a. Parse X/package.json, and look for "main" field.
       b. let M = X + (json main field)
       c. LOAD_AS_FILE(M)
    2. If X/index.js is a file, load X/index.js as JavaScript text.  STOP
    3. If X/index.node is a file, load X/index.node as binary addon.  STOP

    LOAD_NODE_MODULES(X, START)
    1. let DIRS=NODE_MODULES_PATHS(START)
    2. for each DIR in DIRS:
       a. LOAD_AS_FILE(DIR/X)
       b. LOAD_AS_DIRECTORY(DIR/X)

    NODE_MODULES_PATHS(START)
    1. let PARTS = path split(START)
    2. let ROOT = index of first instance of "node_modules" in PARTS, or 0
    3. let I = count of PARTS - 1
    4. let DIRS = []
    5. while I > ROOT,
       a. if PARTS[I] = "node_modules" CONTINUE
       c. DIR = path join(PARTS[0 .. I] + "node_modules")
       b. DIRS = DIRS + DIR
       c. let I = I - 1
    6. return DIRS

### 从全局目录中加载

如果`NODE_PATH`环境变量的值是以冒号分隔的绝对路径列表，那么当在别处找不到模块时，
node就会搜索这些路径。（注意：在Windows里，`NODE_PATH`中用分号来代替冒号的。）

此外，node还会搜索以下这些位置：

* 1: `$HOME/.node_modules`
* 2: `$HOME/.node_libraries`
* 3: `$PREFIX/lib/node`

这里的`$HOME`是用户主目录，而`$PREFIX`是node的配置项`installPrefix`。

这样做的原因有历史渊源。我们鼓励开发者把依赖包都放在`node_modules`目录下。
这样不仅加载的更快，而且更可靠。

### 访问主模块

When a file is run directly from Node, `require.main` is set to its
`module`. That means that you can determine whether a file has been run
directly by testing

    require.main === module

For a file `foo.js`, this will be `true` if run via `node foo.js`, but
`false` if run by `require('./foo')`.

Because `module` provides a `filename` property (normally equivalent to
`__filename`), the entry point of the current application can be obtained
by checking `require.main.filename`.

## Addenda: Package Manager Tips

The semantics of Node's `require()` function were designed to be general
enough to support a number of sane directory structures. Package manager
programs such as `dpkg`, `rpm`, and `npm` will hopefully find it possible to
build native packages from Node modules without modification.

Below we give a suggested directory structure that could work:

Let's say that we wanted to have the folder at
`/usr/lib/node/<some-package>/<some-version>` hold the contents of a
specific version of a package.

Packages can depend on one another. In order to install package `foo`, you
may have to install a specific version of package `bar`.  The `bar` package
may itself have dependencies, and in some cases, these dependencies may even
collide or form cycles.

Since Node looks up the `realpath` of any modules it loads (that is,
resolves symlinks), and then looks for their dependencies in the
`node_modules` folders as described above, this situation is very simple to
resolve with the following architecture:

* `/usr/lib/node/foo/1.2.3/` - Contents of the `foo` package, version 1.2.3.
* `/usr/lib/node/bar/4.3.2/` - Contents of the `bar` package that `foo`
  depends on.
* `/usr/lib/node/foo/1.2.3/node_modules/bar` - Symbolic link to
  `/usr/lib/node/bar/4.3.2/`.
* `/usr/lib/node/bar/4.3.2/node_modules/*` - Symbolic links to the packages
  that `bar` depends on.

Thus, even if a cycle is encountered, or if there are dependency
conflicts, every module will be able to get a version of its dependency
that it can use.

When the code in the `foo` package does `require('bar')`, it will get the
version that is symlinked into `/usr/lib/node/foo/1.2.3/node_modules/bar`.
Then, when the code in the `bar` package calls `require('quux')`, it'll get
the version that is symlinked into
`/usr/lib/node/bar/4.3.2/node_modules/quux`.

Furthermore, to make the module lookup process even more optimal, rather
than putting packages directly in `/usr/lib/node`, we could put them in
`/usr/lib/node_modules/<name>/<version>`.  Then node will not bother
looking for missing dependencies in `/usr/node_modules` or `/node_modules`.

In order to make modules available to the node REPL, it might be useful to
also add the `/usr/lib/node_modules` folder to the `$NODE_PATH` environment
variable.  Since the module lookups using `node_modules` folders are all
relative, and based on the real path of the files making the calls to
`require()`, the packages themselves can be anywhere.
