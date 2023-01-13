# /bin/bash
DIR=$(pwd)
APK_PATH=$1
MOD_PATH=$2
SIG_DIR="$DIR/$3"
DECOMPILED_NAME="DropmixDecomp"
DECOMPILED_DIR="${DIR}/decompiled"
APK_OUTPUT_NAME="DropMix 1.9.0.apk"
SHAREDASSETS0="$DECOMPILED_DIR/assets/bin/Data/sharedassets0.assets.split194"

echo "This script is untested beyond personal use and may damage you laptop or android device, and runs a high risk of damaging your existing dropmix data (so please back up everything first!)"
echo "To confirm you are okay with running this script and are aware of the risks, you must remove the next line which unblocks the script from running"
exit 1

getFileSize(){
    wc -c "$1" | awk '{print $1}'
}

validateEnvironment() {
    JAVA_VER=$(java -version 2>&1)

    if [[ "$JAVA_VER" == *"1.8"* ]]; then
        echo "Validated Java version should be correct"
        echo $JAVA_VER
    else
        echo "Java version appears to not be Java 8, this script relies of Java 8 currently"
        exit 1
    fi

    if [[ "$(apktool -version)" == "" ]]; then
        echo "apktool not found, exiting"
        exit 1
    fi
}

validateEnvironment

if [ -f "$DECOMPILED_DIR" ]; then
    echo "Output directory already exists, will be overwritten when unpacking Android package"
fi

if [ -f "$APK_PATH" ]; then
    echo $APK_PATH
else
    echo "APK file not found at $APK_PATH"
    exit 1
fi

echo $SIG_DIR
echo  "$SIG_DIR/signapk.jar"
if [ -f "$SIG_DIR/signapk.jar" ]; then
    echo "Using $SIG_DIR"
else
    echo "No path provided for APK signing, please clone https://github.com/techexpertize/SignApk"
    exit 1
fi

# rm -rf "$DECOMPILED_DIR" || echo "Decompiled file does not exist"
echo "apktool d -rf \"$APK_PATH\" -o $DECOMPILED_DIR"
apktool d -rf "$APK_PATH" -o $DECOMPILED_DIR

echo $SHAREDASSETS0
SHAREDASSETS0_SIZE=$(getFileSize $SHAREDASSETS0)

FILELIST=$(ls -f $MOD_PATH)

lineBreak() {
    echo "=====++$1++===="
}

UPDATED_NAME="updatedFile"

cp "$SHAREDASSETS0" originalData

applyMod() {
    file=$1
    echo $file
    echo $(getFileSize $file)
    if [[ "$SHAREDASSETS0_SIZE" != "$(getFileSize $file)" ]]; then
        echo "Invalid file size, skipping: $file"
    else
        rm -rf $DECOMPILED_DIR
        echo "apktool d -rf \"$APK_PATH\" -o $DECOMPILED_DIR"
        apktool d -rf "$APK_PATH" -o $DECOMPILED_DIR
        rm "$UPDATED_NAME" || echo "No file copy to delete, continuing..."

        echo "Copy Attempt 1: $file to $UPDATED_NAME "
        cp $file $UPDATED_NAME
        echo "Copy Attempt 2 "
        cp "$file" "$UPDATED_NAME"

        rm "$SHAREDASSETS0"
        mv $UPDATED_NAME $SHAREDASSETS0
        echo "Move Attempt 1: $UPDATED_NAME to $SHAREDASSETS0 "
        mv "$UPDATED_NAME" "$SHAREDASSETS0"
        echo "Move Attempt 2"
        NEW_DIR=signed${1}
        echo "New directory for outputted file: $DIR/$NEW_DIR"
        [ -d $DIR/$NEW_DIR ] || mkdir $DIR/$NEW_DIR

        cp $file $LEVEL0
        dot_clean $DECOMPILED_DIR
        apktool b $DECOMPILED_DIR
        cd $SIG_DIR

        INPUT="$DECOMPILED_DIR/dist/$APK_OUTPUT_NAME"
        OUTPUT="$DIR/$NEW_DIR/$APK_OUTPUT_NAME"

        echo "File to send for signing: $INPUT"

        [ -d signed ] || mkdir signed
        cp "${INPUT}" signed/in.apk

        java -jar signapk.jar certificate.pem key.pk8 signed/in.apk signed/out.apk
        echo "Move attempt 1 Directory to output to ${OUTPUT}"
        mv signed/out.apk $OUTPUT
        echo "Move Attempt 2"
        mv signed/out.apk "$OUTPUT"
        rm signed/in.apk

        cd $DIR
    fi
}

for file in $FILELIST
do
    ## if file is not JSON
    if [[ $file != "." && $file != ".." ]]; then
        # echo $MOD_PATH/$file
        applyMod $MOD_PATH/$file
    fi
    ## copy json to signed folder
done

rm "$SHAREDASSETS0" || echo "No file copy to delete, continuing..."
mv originalData "$SHAREDASSETS0"
