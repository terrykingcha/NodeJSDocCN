# 官方文档同步标识

 - Version: v0.6.11
 - Commit hash: 7343f8e776146bf4461348a9130f2c5040a0dfa0
 - Date: 2012/2/10 13:58:58

# 最近更新

>完成加密模块文档的翻译
>修正HTML模板的一些bug

# 中文目录和翻译进度

* [摘要](./NodeJSDocCN/blob/master/api/synopsis_cn.markdown)
* [全局对象](./NodeJSDocCN/blob/master/api/globals_cn.markdown)
* [标准输入输出（console）](./NodeJSDocCN/blob/master/api/stdio_cn.markdown)
* [定时器](./NodeJSDocCN/blob/master/api/timers_cn.markdown)
* [模块](./NodeJSDocCN/blob/master/api/modules_cn.markdown)
* [C/C++ 扩展](./NodeJSDocCN/blob/master/api/addons_cn.markdown)
* [进程对象（process）](./NodeJSDocCN/blob/master/api/process_cn.markdown)
* [常用工具（util）](./NodeJSDocCN/blob/master/api/util_cn.markdown)
* [事件模块（events）](./NodeJSDocCN/blob/master/api/events_cn.markdown)
* [缓冲器类（Buffer）](./NodeJSDocCN/blob/master/api/buffer_cn.markdown)
* [流接口（Stream）](./NodeJSDocCN/blob/master/api/stream_cn.markdown)
* [加密模块（crypto）](./NodeJSDocCN/blob/master/api/crypto_cn.markdown)
* 安全传输协议（tls/ssl）
* 字符串解码
* 文件系统（fs）
* 路径模块（path）
* 网络模块（net）
* 数据报文协议（udp/dgram）
* 域名服务（dns）
* 超文本传输协议（http）
* 安全超文本传输协议（https）
* 网址解析模块（url）
* 查询串解析模块（querystring）
* 行读取模块（readline）
* 交互式命令行（repl）
* 虚拟解析模块（vm）
* 子进程模块（child_process）
* 断言模块（assert）
* 终端模块（tty）
* 数据压缩对象（zlib）
* 操作系统模块（os）
* 调试声明（debugger）
* 多核模块（cluster）
* 附录
  * 附录 1: 第三方模块推荐

# 翻译斟酌

##addons_cn

 - Addon patterns是否保留英文原文（line 80）

##modules_cn

 - 关于`module.require`的作用（line 232）

>Note that in order to do this, you must get a reference to the `module`
>object.  Since `require()` returns the `exports`, and the `module` is
>typically *only* available within a specific module's code, it must be
>explicitly exported in order to be used.

>注意，为了使用require方法，必须先获得对`module`对象的引用。因为`require()`会返回`exports`，
>并且`module`通常只在特殊的模块代码中有效，所以只在需要用到时才导出。

##stream_cn

 - 关于`incoming`的正确释义（line 40）

>Emitted when the underlying file descriptor has been closed. Not all streams
>will emit this.  (For example, an incoming HTTP request will not emit
>`'close'`.)

>当底层的文件描述符被关闭时触发。并不是所有的流都会触发这个事件。（例如，一个达到的HTTP请求就不会触发`'close'`。）

##crypto_cn

 - 关于crypto.getDiffieHellman（line 261）

>The advantage of using this routine is that the parties don't have to
>generate nor exchange group modulus beforehand, saving both processor and
>communication time.

>用这个程序的好处是不需要预先生成多方也不需要改变组模块，可以同时节省处理和通讯的时间。