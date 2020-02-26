git checkout master

# publish
VERSION=$(cat version | awk '{$1=$1;print}')
lerna run build
lerna publish $VERSION --yes
