#!/bin/bash
#
# build-dev-center.sh beta
# build-dev-center.sh prod

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

echo -e "\n==Building environment '$build_env'..."

# BUILD_BIN_DIR is where this script was loaded from
export BUILD_BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo -e "\tBUILD_BIN_DIR=$BUILD_BIN_DIR"
[[ -d "$BUILD_BIN_DIR" ]] || { echo "ERROR: Missing dir '$BUILD_BIN_DIR"; exit 1; }


# BUILD_ROOT_SERVER is where the backend code lives
export BUILD_ROOT_SERVER="${BUILD_BIN_DIR%/*/*}/server"
echo -e "\BUILD_ROOT_SERVER=$BUILD_ROOT_SERVER"
[[ -d "$BUILD_ROOT_SERVER" ]] || { echo "ERROR: Missing dir '$BUILD_ROOT_SERVER"; exit 1; }

# BUILD_ROOT_CLIENT is where the frontend code lives
export BUILD_ROOT_CLIENT="${BUILD_BIN_DIR%/*/*}/ng-devCenter"
echo -e "\BUILD_ROOT_CLIENT=$BUILD_ROOT_CLIENT"
[[ -d "$BUILD_ROOT_CLIENT" ]] || { echo "ERROR: Missing dir '$BUILD_ROOT_CLIENT"; exit 1; }

# BUILD_ROOT_CLIENT_DIST is where the frontend dist code lives
export BUILD_ROOT_CLIENT_DIST="${BUILD_BIN_DIR%/*/*}/ng-devCenter/dist/"
echo -e "\BUILD_ROOT_CLIENT_DIST=$BUILD_ROOT_CLIENT_DIST"


##
## initialize npm and git
##
NPM=/usr/local/bin/npm
BOWER=/usr/local/bin/bower

echo -e "\n==Configuring npm and git..."
$NPM config set proxy http://one.proxy.att.com:8080
$NPM config set https-proxy http://one.proxy.att.com:8080
 
git config --global http.proxy http://one.proxy.att.com:8080
git config --global https.proxy http://one.proxy.att.com:8080
git config --global http.sslVerify "false"
git config --global url."https://".insteadOf git://


# ##
# ## clean out previous build
# ##
# echo -e "\n==Cleaning previous build..."

# if ! cd "$BUILD_ROOT_CLIENT/" ; then
# 	mkdir "$BUILD_ROOT_CLIENT_DIST/";
# fi

# /bin/rm -rf "$BUILD_ROOT_CLIENT/" &>/dev/null
