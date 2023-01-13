APK_NAME="$2"
DATA_DIR="$3"

echo "This script requires android debugging to be enabled and only one device to be connected to the computer."
echo "Due to the nature of this script (and my relatively weak scripting skills), there is a big risk of damage to your device if you do not understand both the script and commands within, this is done at your own risk."
echo "To confirm you understand you are okay with the potential risks involved, remove the next line."
exit 1

DEVICE_LIST=$(adb devices)

if [[ "$DEVICE_LIST" == "List of devices attached" ]]; then
  echo "no device"
  exit 1
else
  echo "at least one device [TODO ensure only one device]\n"
fi

if [[ "$DEVICE_LIST" == *"List of devices attached"* ]]; then
  echo "adb installation validation: successful [TODO improve validation]"
else
  echo "adb not working or not installed, please install ADB to proceed"
  exit 1
fi

CURLSTRING=$(curl --version)

if [[ "$CURLSTRING" == *"ftps"* ]]; then
  echo "curl installation validation: successful"
else
  echo "curl not installed"
fi

if [[ "$APK_NAME" == "" ]]; then 
  APK_NAME="$(pwd)/dropmix/DropMix 1.9.0.apk"
  echo "Using default APK: $APK_NAME"
elif [[ "$APK_NAME" == "0" ]]; then
  echo "Using provided APK: $APK_NAME"
fi

if [[ "$DATA_DIR" = "" ]]; then
  echo "Not data directory provided, using archive.org data files"
  APK_URL="https://archive.org/download/harmonix-drop-mix-android-v-1.9.0-obb-data/Harmonix%20DropMix%20Android%20v1.9.0%20%5Bobb%20%2B%20data%5D.zip"
  curl --get "$APK_URL" -O -J -L
  ZIP_NAME="Harmonix DropMix Android v1.9.0 [obb + data].zip"
  unzip "$ZIP_NAME"
  DATA_DIR="$(pwd)/dropmix"
elsel
  echo "using provided data files"
fi

if [ adb install "$APK_NAME" ]; then
  echo "Installed dropmix"
else
  echo "Dropmix already installed, uninstall required"
  echo "Uninstalling"
  adb uninstall com.hasbro.dropmix
  adb install "$APK_NAME"
  echo "Successfully reinstalled"
fi

# adb add data
echo "1/2 Pushing android/data file to phone, this file is large and may take a long timeplease do not disconnect..."
adb push "${DATA_DIR}/android/data/com.hasbro.dropmix/." /sdcard/Android/data/com.hasbro.dropmix/
echo "android/data updated."
echo "2/2 Pushing android/obb to phone, please do not disconnect.."
adb push "${DATA_DIR}/android/obb/com.hasbro.dropmix/." /sdcard/Android/data/com.hasbro.dropmix/

echo "The app should be installed now"
