## Desktop Modding Tool

A Java based desktop application designed to allow much more streamlined modifying of the Android application, available [here](https://github.com/padraigfl/Java-Dropmix-Utility-Tool/releases)

### Why is it better

1. Dependency free: all dependencies are packages within the application
1. Self-contained: Can directly output a modified version of the application and install it to a device without the need for additional scripts and knowledge of tools such as apktool or apksigner
1. Java based meaning same programing knowledge as many Android apps, using an extremely old version of Java to maximise compatibilty
1. Greater focus on being a general utility Dropmix app; long term plan is for it to contain a variety of useful tools for keeping the application usable into the future


### Current status

Project was thrown together relatively quickly and therefore has some restrictions such as being mostly untested outside of macOS.

The biggest known issues currently are:

- Single process application: this means the UI lags hugely at points where it really shouldn't. Please take your time waiting for any buttons that are doing intense processes (specifically decompiling and recompiling the android package)
- Fresh database install required following each app mod: this may require switchng to a lower level database to fix. 