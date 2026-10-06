#!/usr/bin/env bash
set -e

# ==============================================================================
# JumpJump iOS IPA Build & Packaging Script
# Compiles native arm64 Mach-O binary and packages installable IPA
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK_PATH="${SDK_PATH:-/opt/theos-sdks/iPhoneOS16.5.sdk}"
BUILD_DIR="${PROJECT_DIR}/ios/build"
APP_DIR="${BUILD_DIR}/Payload/JumpJump.app"
OUTPUT_IPA="${PROJECT_DIR}/JumpJump.ipa"

echo "=== Building JumpJump iOS App ==="
echo "Project Directory: ${PROJECT_DIR}"
echo "SDK Path: ${SDK_PATH}"

# Check SDK
if [ ! -d "${SDK_PATH}" ]; then
    echo "Error: iOS SDK not found at ${SDK_PATH}"
    exit 1
fi

# Clean & create build folders
rm -rf "${BUILD_DIR}"
mkdir -p "${APP_DIR}/www"

# 1. Compile Objective-C arm64 Mach-O binary
echo "Compiling native arm64 Mach-O binary..."
clang -target arm64-apple-ios14.0 \
    -isysroot "${SDK_PATH}" \
    -fuse-ld=lld \
    -framework UIKit \
    -framework Foundation \
    -framework WebKit \
    -fobjc-arc \
    -O2 \
    -I"${PROJECT_DIR}/ios/JumpJump" \
    "${PROJECT_DIR}/ios/JumpJump/main.m" \
    "${PROJECT_DIR}/ios/JumpJump/AppDelegate.m" \
    "${PROJECT_DIR}/ios/JumpJump/ViewController.m" \
    -o "${APP_DIR}/JumpJump"

# 2. Pseudo-sign binary with ldid
echo "Signing binary with ldid..."
cat << 'EOF' > "${BUILD_DIR}/entitlements.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>get-task-allow</key>
    <true/>
</dict>
</plist>
EOF

if command -v ldid &> /dev/null; then
    ldid -S"${BUILD_DIR}/entitlements.plist" "${APP_DIR}/JumpJump"
fi

# 3. Copy Info.plist and PkgInfo
cp "${PROJECT_DIR}/ios/JumpJump/Info.plist" "${APP_DIR}/Info.plist"
printf "APPL????" > "${APP_DIR}/PkgInfo"

# 4. Copy Icons to App root
cp "${PROJECT_DIR}/app/icons/"*.png "${APP_DIR}/"

# 5. Copy offline web assets into app bundle
echo "Bundling offline game assets..."
cp -r "${PROJECT_DIR}/app/"* "${APP_DIR}/www/"
cp -r "${PROJECT_DIR}/app/"* "${APP_DIR}/"

# 6. Package into .ipa (zip Payload)
echo "Packaging JumpJump.ipa..."
rm -f "${OUTPUT_IPA}"
cd "${BUILD_DIR}"
zip -r -q -9 "${OUTPUT_IPA}" Payload/

echo "=== Build Complete! ==="
echo "IPA created at: ${OUTPUT_IPA}"
ls -lh "${OUTPUT_IPA}"
