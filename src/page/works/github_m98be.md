---
template: "work_detail"
title: github.m98.be
desc: コントリビュートの森を3Dで可視化
url:
  - name: Demo
    url: https://github.m98.be/
  - name: github
    url: https://github.com/mochiya98/mochiya98.github.io
tag:
  - three.js
  - O-GL
  - GLSL
  - PHP
---
## 概要
GitHub上のコントリビューショングラフを3Dグラフにすれば分かりやすくなるのではないかと思い、制作。  
虹色にしてちょっとかわいい感じに。  

## 3D描写の軽量化
最初はthree.jsで制作していましたが、バンドルサイズ300KBを超えているのが気になり、低レベルなライブラリで書き直すことで軽量化。  
軽量化にあたって、初めてのGLSLで初めてのシェーダーを書いたりした。(Directional Light相当)  

## APIについて
コントリビューションデータは今JSONで取れなくなっているので、変換API経由で表示させています。  
元々はGASで表示させていたものの、データをキャッシュしてもそれなりに遅いので、zeit nowを利用。  
エッジキャッシュが有効なので、キャッシュヒットすれば高速でレスポンスが帰ってきます。

## 雑感
3D化することで、ヒートマップでは分かりづらいスパイクがうまく可視化できたと思う。  
