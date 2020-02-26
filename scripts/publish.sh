git config --local user.name "wangshijun"
git config --local user.email "wangshijun2010@gmail.com"

git remote remove origin
git remote add origin "https://$GITHUB_TOKEN@github.com/$TRAVIS_REPO_SLUG.git"
git remote -v
git pull origin master
git branch -a

changed=$(lerna changed)
echo "lerna changed ${changed}"
if [ "$changed" != "" ]; then
  DEBUG=* node scripts/setup-ci.js

  git checkout master
  git commit -am "update yarn.lock file"

  # publish
  VERSION=$(cat version | awk '{$1=$1;print}')
  echo "publish version ${VERSION}"
  lerna run build --scope @arcblock/*
  lerna publish $VERSION --yes

	make delete-release
	make build-release
	make release

  # trigger cnpm sync
  node scripts/post-publish.js
fi
