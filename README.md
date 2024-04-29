# VanillaJS를 이용한 notion 프로젝트

VanillaJS만을 이용해서 만든 notion과 같은 기록 서비스입니다. 


## 배포
[배포링크](https://fedc-4-5-project-notion-vanilla-js-nine.vercel.app/)


## 기능
- 문서 작성, 자동 저장, 저장된 글 불러오기 
- 간단한 마크다운을 지원합니다.(h1, h2, h3, 리스트 아이템, 취소선)
- 다크 모드

## 프로젝트 구조
App 컴포넌트에서 모든 이벤트를 위임받아서 이벤트를 처리하고 있습니다. <br>
ListPage, EditorPage는 App에서 전달해주는 props를 보여주는 역학만 하고 있습니다. 

<img width="600" alt="Untitled" src="https://github.com/qkdl60/FEDC4-5_Project_Notion_VanillaJS/assets/61609327/cc54ac0a-911d-4d30-8dfd-bdca08ef95b6">
<img width="600" alt="Untitled" src="https://github.com/qkdl60/FEDC4-5_Project_Notion_VanillaJS/assets/61609327/095cf3ca-e768-47a9-bf06-b2a38818f267">


## 시연 영상
![시연](https://github.com/qkdl60/FEDC4-5_Project_Notion_VanillaJS/assets/61609327/a89ec61c-657f-498a-a12c-682f919da3fe)

