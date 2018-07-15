---
template: "work_detail"
title: bs_taskbar
desc: 電源状態によってタスクバーの色を変える
url: []
tag:
  - C#
  - FullScratch
---
![bs_taskbar_01](/pic/bs_taskbar_01.png)
## 概要
電源状態によってタスクバーの色を変える  
AC時は黒色、DC(バッテリー)時は橙色  

## 雑感
**充電してたつもりが刺さってなかった！待って、スタンバイ待って！**  
みたいなことありませんか？  
あと気が付いたら抜けてた、とか。  
そんな電源状態の変化を分かりやすくするために作りました  
## その他
力技実装、環境依存激しいので非公開  
内部APIのSetWindowCompositionAttributeを使って色操作、あとSetWindowSubclassでWindowProc刺してWM_DWMCOLORIZATIONCOLORCHANGEDとか諸々をhookして状態維持。  
ドキュメントに無いAPIなのでインターフェイス変わりがち  
