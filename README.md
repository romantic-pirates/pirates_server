1. 기능 브랜치 생성
기능을 개발할 때, develop 브랜치에서 새로운 기능 브랜치를 만듭니다. 기능 브랜치는 특정 기능 또는 이슈를 처리하기 위한 브랜치입니다.

<터미널>
git checkout develop
git pull origin develop
git checkout -b feature/#이슈번호_이슈제목

2. 기능 개발 및 커밋
기능 브랜치에서 작업을 하고, 변경 사항을 커밋합니다.

<터미널>
git add .
git commit -m "Add feature: 설명 추가"
이 단계를 반복하여 기능 개발을 완료합니다.

3. 기능 브랜치 푸시
기능 브랜치를 원격 저장소에 푸시하여 다른 팀원들과 공유할 수 있습니다.

<터미널>
코드 복사
git push origin feature/#이슈번호_이슈제목

4. Pull Request 생성
기능 개발이 완료되면, 기능 브랜치를 develop 브랜치에 병합하기 위한 Pull Request를 생성합니다. Pull Request를 통해 팀원들과 코드 리뷰를 진행하고, 피드백을 반영할 수 있습니다.
<깃사이트에서 PR 작성>

6. Pull Request 병합 <담당자 : 김동규>
Pull Request가 승인되면, develop 브랜치에 병합합니다. Git Flow에서는 develop 브랜치가 다음 릴리스의 베이스라인 역할을 하기 때문에, 모든 기능이 이 브랜치에 병합됩니다.

-> 병합 완료되면 사용자
git checkout develop
git pull origin develop
git merge feature/your-feature-name
또는, Pull Request를 통해 자동으로 병합할 수 있습니다.

6. 기능 브랜치 삭제
기능 브랜치가 develop 브랜치에 병합된 후, 더 이상 필요하지 않으므로 삭제합니다.

<터미널>
# 로컬 브랜치 삭제
git branch -d feature/#이슈번호_이슈제목

# 원격 브랜치 삭제
git push origin --delete feature/#이슈번호_이슈제목
7. 최신 develop 브랜치로 유지
develop 브랜치를 최신 상태로 유지하기 위해, 다른 팀원들이 병합한 변경 사항을 가져옵니다.

bash
코드 복사
git pull origin develop
