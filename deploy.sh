#!/bin/bash
#
# build-dev-center.sh beta
# build-dev-center.sh prod


##
## node_modules clean up
##
npm_clean_up() {
	echo -e "==cleaning up node_modules..."
	if ! /bin/rm -rf "$BUILD_ROOT_CLIENT/node_modules" ; then
		echo "ERROR: node_modules clean up failed"
		exit 1
	fi
}


echo -e "\nBUILDING DEV CENTER..."

build_env='beta'
while (( $# > 0 ))
do
	case "$1" in
		--env)
			shift
			build_env="$1"
			;;
		*)
			echo "ERROR: invalid option '$1'"
			exit 1
			;;
	esac
	shift
done

echo -e "==Building environment '$build_env'..."

# BUILD_BIN_DIR is where this script was loaded from
export BUILD_BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo -e "\tBUILD_BIN_DIR=$BUILD_BIN_DIR"
[[ -d "$BUILD_BIN_DIR" ]] || { echo "ERROR: Missing dir '$BUILD_BIN_DIR"; exit 1; }

# DEPLOY_DIR is where frontend is deployed
export DEPLOY_DIR="/opt/${USER}/www"
echo -e "\tDEPLOY_DIR=$DEPLOY_DIR"
[[ -d "$DEPLOY_DIR" ]] || { echo "ERROR: Missing dir '$DEPLOY_DIR"; exit 1; }

# BUILD_ROOT_SERVER is where the backend code lives
export BUILD_ROOT_SERVER="${BUILD_BIN_DIR}/server"
echo -e "\tBUILD_ROOT_SERVER=$BUILD_ROOT_SERVER"
[[ -d "$BUILD_ROOT_SERVER" ]] || { echo "ERROR: Missing dir '$BUILD_ROOT_SERVER"; exit 1; }

# BUILD_ROOT_CLIENT is where the frontend code lives
export BUILD_ROOT_CLIENT="${BUILD_BIN_DIR}/ng-devCenter"
echo -e "\tBUILD_ROOT_CLIENT=$BUILD_ROOT_CLIENT"
[[ -d "$BUILD_ROOT_CLIENT" ]] || { echo "ERROR: Missing dir '$BUILD_ROOT_CLIENT"; exit 1; }

# BUILD_ROOT_CLIENT_DIST is where the frontend dist code lives
export BUILD_ROOT_CLIENT_DIST="${BUILD_BIN_DIR}/ng-devCenter/dist/"
echo -e "\tBUILD_ROOT_CLIENT_DIST=$BUILD_ROOT_CLIENT_DIST"

# ##
# ## clean out previous build
# ##
echo -e "==Cleaning previous build..."
if [[ -d "$BUILD_ROOT_CLIENT_DIST/" ]] ; then
	/bin/rm -rf "$BUILD_ROOT_CLIENT_DIST/" &>/dev/null;
fi

##
## initialize npm and git
##
NPM=/usr/local/bin/npm
BOWER=/usr/local/bin/bower

echo -e "==Configuring npm and git..."
$NPM config set proxy http://one.proxy.att.com:8080
$NPM config set https-proxy http://one.proxy.att.com:8080
 
git config --global http.proxy http://one.proxy.att.com:8080
git config --global https.proxy http://one.proxy.att.com:8080
git config --global http.sslVerify "false"
git config --global url."https://".insteadOf git://


##
## npm install
##
echo -e "==Running npm install..."
npm_clean_up()
cd $BUILD_ROOT_CLIENT

if ! "$NPM" install ; then
	echo "ERROR: $NPM install failed"
	npm_clean_up()
	exit 1
fi

##
## build Angular
##
echo -e "==Building Angular with --environment=$build_env"
if ! ng build --environment="$build_env" ; then
	echo "ERROR: Angular build failed"
	npm_clean_up()
	exit 1
fi

##
## deploy frontend
##
echo -e "==Deploying frontend build"
if ! mv "${BUILD_ROOT_CLIENT}/dist  ${DEPLOY_DIR}/devCenterBeta"; then
	echo "ERROR: Deploying Angular build to ${BUILD_ROOT_CLIENT}/dist failed"
	npm_clean_up()
	exit 1
fi

##
## deploy backend
##
# echo -e "==Deploying backend build"
# if ! mv "${BUILD_ROOT_CLIENT}/dist  ${DEPLOY_DIR}/devCenterBeta"; then
# 	echo "ERROR: Deploying Angular build to ${BUILD_ROOT_CLIENT}/dist failed"
#	npm_clean_up()
# 	exit 1
# fi