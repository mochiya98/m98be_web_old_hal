---
template: "work_detail"
title: TransparentCMD
desc: Win10で背景AeroGlassなcmd(色付き)
url: []
tag:
  - C(C++)
  - FullScratch
---
![transparent_cmd_01](/pic/transparent_cmd_01.png)
## 概要
Win10で背景AeroGlassなcmd(色付き)  
タイトルバーの右クリックから背景色変更  
HKCU\\Software\\TransparentCMD\\[R/G/B/A]にDWORDでデフォルト背景色を設定  
黒を透過してるので、cmdの背景色をrgb(0,0,0)に設定しておくこと  
パスにbashかwsl含むとwslのbashを呼ぶやつに化ける(複数ビルドとか引数が普通だと思いますが、諸事情でこんな謎実装に)

## これいる？
ほしい ちょうど切らしてた  
