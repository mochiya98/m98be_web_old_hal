---
template: "work_detail"
title: (Docker)ubuntu-cpp-build
desc: TravisCIでC++をクロスコンパイルするためのDockerImage
url:
  - name: github
    url: https://github.com/mochiya98/docker_ubuntu-cpp-build
  - name: Docker Hub
    url: https://hub.docker.com/r/mochiya98/ubuntu-cpp-build/
tag:
  - FullScratch
  - Docker
---
## 概要
TravisCIのビルド環境古すぎた  
Dockerの有り難さをCIで知った  

## 雑感
weekly buildでlatestだけ吐いてます  
最新への追従だけが目的なので、あまりキャッシュ等は考慮してない  
あくまでTravisCI用…(ぁ  
