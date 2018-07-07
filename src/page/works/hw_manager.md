---
template: "work_detail"
title: HW Manager
desc: 学校の課題を管理するWebアプリ(非汎用)
url:
  - name: github(front-end)
    url: https://github.com/mochiya98/hw_manager
  - name: github(server-side)
    url: https://github.com/mochiya98/hw_manager_api
  - name: Demo
    url: https://github.m98.be/hw_manager/
tag:
  - Docker
  - E2ETest
  - Express
  - Hyperapp
  - mongodb
  - OpenAPI
---
## 概要
欠席時の課題確認や、メモ忘れによる課題忘れを防止する為の支援ツール
## 作ったもの
Web上で課題の追加/変更/削除/確認、及びLINEでの前日リマインド。
## hyperapp
モバイルで頻繁に利用するシーンを想定している為、低速な環境でも快適に利用できるよう、軽量なフレームワークを採用した。  
今回のアプリはかなり小規模な為、三大フロントエンドフレームワーク(Angular/React/Vue)のような機能性は不要。
## E2E Test(Puppeteer)
半分お試し。一通りE2Eテスト出来るようにした。
## OpenAPI(旧Swagger)
API仕様を明確に。サーバーサイドではパラメータのValidationにも利用。  
[APIDocs](https://github.m98.be/hw_manager_api/)