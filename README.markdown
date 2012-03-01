# 官方文档同步标识

 - Version: v0.6.11
 - Commit hash: 7343f8e776146bf4461348a9130f2c5040a0dfa0
 - Date: 2012/2/10 13:58:58

# 翻译斟酌

##addons_cn

 - Addon patterns是否保留英文原文（line 80）

##module_cn

 - 关于`module.require`的作用(line 385)

>Note that in order to do this, you must get a reference to the `module`
>object.  Since `require()` returns the `exports`, and the `module` is
>typically *only* available within a specific module's code, it must be
>explicitly exported in order to be used.

>注意，为了使用require方法，必须先获得对`module`对象的引用。因为`require()`会返回`exports`，
>并且`module`通常只在特殊的模块代码中有效，所以只在需要用到时才导出。
