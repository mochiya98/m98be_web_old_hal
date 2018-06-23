---
template: "work_detail"
title: GoogleOTPManager
desc: Web版Google認証アプリみたいなやつ
url:
  - name: WebPage
    url: http://512trr.webcrow.jp/gauth.html
tag: []
---
## 概要
Google認証アプリもどき  
意外と単純なアルゴリズムだったので試作したもの  
今だと便利なライブラリがある  
SHA-1のライブラリだけ引用
## 内容
```
getGoogleOTP=function(a){a=h(("000000000000000"+(~~(Date.now()/30000)).toString(16))
.slice(-16),b322n(a));return ((parseInt(a.substr(parseInt(a.slice(-1),16)*2,8),16)&0x7fffffff)+"").slice(-6)};
```
だいたいここらへん  
当時、本当にシンプルで驚いた。