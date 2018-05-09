#!/usr/bin/env bash
if [ "$(readlink "$0")" == "" ]; then
    pushd `dirname $0` > /dev/null
    export GD_DIR=`pwd -P`
    popd > /dev/null
else
    export GD_DIR=$(readlink "$0" | xargs dirname)
fi
export ENTRY_DIR=$(pwd)

echo "GD_DIR: $GD_DIR"
echo "ENTRY_DIR: $ENTRY_DIR"

source "$GD_DIR/lib/version-check"
source "$GD_DIR/lib/tasks"

for arg in $@; do
    ${arg}
done
