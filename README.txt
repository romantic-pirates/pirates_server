Git Flow Feature Branch Workflow
이 문서는 Git Flow를 사용하여 기능 브랜치를 생성하고 관리하는 절차를 설명합니다.

1. 기능 브랜치 생성
기능을 개발할 때, develop 브랜치에서 새로운 기능 브랜치를 만듭니다. 기능 브랜치는 특정 기능 또는 이슈를 처리하기 위한 브랜치입니다.

git checkout develop
git pull origin develop
git checkout -b feature/#이슈번호_이슈제목

2. 기능 개발 및 커밋
기능 브랜치에서 작업을 진행하고, 변경 사항을 커밋합니다.

git add .
git commit -m "Add feature: 작업내용"
기능 개발이 완료될 때까지 이 단계를 반복합니다.

3. 기능 브랜치 푸시
완료된 기능 브랜치를 원격 저장소에 푸시하여 다른 팀원들과 공유합니다.

git push origin feature/#이슈번호_이슈제목

4. Pull Request 생성
기능 개발이 완료되면, 기능 브랜치를 develop 브랜치에 병합하기 위한 Pull Request를 생성합니다. Git 호스팅 플랫폼(예: GitHub)에서 PR을 작성하여 팀원들과 코드 리뷰를 진행하고 피드백을 반영합니다.

5. Pull Request 병합 (담당자: 김동규)
Pull Request가 승인되면 develop 브랜치에 병합합니다. Git Flow에서는 develop 브랜치가 다음 릴리스의 베이스라인 역할을 하기 때문에, 모든 기능이 이 브랜치에 병합됩니다.

6. 기능 브랜치 삭제
기능 브랜치가 develop 브랜치에 병합된 후, 더 이상 필요하지 않으므로 삭제합니다.

# 로컬 브랜치 삭제
git branch -d feature/#이슈번호_이슈제목

# 원격 브랜치 삭제
git push origin --delete feature/#이슈번호_이슈제목

7. 최신 develop 브랜치로 체크아웃
develop 브랜치를 최신 상태로 유지하기 위해, 다른 팀원들이 병합한 변경 사항을 가져옵니다.
git checkout develop

